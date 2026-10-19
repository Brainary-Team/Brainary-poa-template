import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { zipSync } from "fflate";
import { parse } from "smol-toml";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const manifestPath = join(root, "manifest.toml");
const entryPath = join(dist, "main.js");
const schemaPath = join(root, "input_schema.json");
const outputPath = join(dist, "my-poa.poa");

function fail(message) {
  throw new Error(`PoA package validation failed: ${message}`);
}

function requireString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${field} must be a non-empty string`);
  }
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory, packageRoot, files) {
  const entries = (await readdir(directory, { withFileTypes: true })).sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(path, packageRoot, files);
      continue;
    }
    if (!entry.isFile()) {
      fail(`MCP resource must be a regular file: ${relative(root, path)}`);
    }
    const name = relative(packageRoot, path).split(sep).join("/");
    files[name] = new Uint8Array(await readFile(path));
  }
}

const manifestText = await readFile(manifestPath, "utf8");
const document = parse(manifestText);
const poa = document?.poa;

if (!poa || typeof poa !== "object") {
  fail("manifest.toml must contain a [poa] table");
}

for (const field of ["namespace", "name", "version", "entry"]) {
  requireString(poa[field], `[poa].${field}`);
}

if (poa.runtime !== "codex-v8") {
  fail(`[poa].runtime must be "codex-v8"`);
}
if (poa.poa_api_version !== 1) {
  fail(`[poa].poa_api_version must be 1`);
}
if (poa.entry !== "main.js") {
  fail(`[poa].entry must be "main.js" for the template build`);
}
if (!(await exists(entryPath))) {
  fail("dist/main.js does not exist; run the build first");
}

const hasSchema = await exists(schemaPath);
if (hasSchema && poa.input_schema !== "input_schema.json") {
  fail(
    'input_schema.json exists, so [poa].input_schema must be "input_schema.json"',
  );
}
if (!hasSchema && poa.input_schema !== undefined) {
  fail("[poa].input_schema points to a missing input_schema.json");
}

const temporaryPackage = await mkdtemp(join(tmpdir(), "brainary-poa-"));
try {
  const mcpSource = join(root, "mcp");
  await writeFile(join(temporaryPackage, "manifest.toml"), manifestText);
  await cp(entryPath, join(temporaryPackage, "main.js"));
  if (hasSchema) {
    await cp(schemaPath, join(temporaryPackage, "input_schema.json"));
  }
  if (await exists(mcpSource)) {
    const mcpFiles = {};
    await collectFiles(mcpSource, root, mcpFiles);
    for (const [name, bytes] of Object.entries(mcpFiles)) {
      if (!name.startsWith("mcp/")) {
        fail(`unexpected MCP path: ${name}`);
      }
      await mkdir(dirname(join(temporaryPackage, name)), { recursive: true });
      await writeFile(join(temporaryPackage, name), bytes);
    }
  }

  const archiveFiles = {};
  await collectFiles(temporaryPackage, temporaryPackage, archiveFiles);
  const archive = zipSync(archiveFiles, {
    level: 6,
    mtime: new Date("1980-01-01T00:00:00Z"),
  });
  await mkdir(dist, { recursive: true });
  await writeFile(outputPath, archive);
  console.log(`Created ${relative(root, outputPath)}`);
} finally {
  await rm(temporaryPackage, { recursive: true, force: true });
}
