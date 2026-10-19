import { readFile } from "node:fs/promises";
import { parse } from "smol-toml";
import { describe, expect, it } from "vitest";

describe("PoA package contract", () => {
  it("uses the current Brainary runtime contract", async () => {
    const manifest = parse(await readFile("manifest.toml", "utf8")) as {
      poa: {
        runtime: string;
        poa_api_version: number;
        entry: string;
      };
    };

    expect(manifest.poa).toMatchObject({
      runtime: "codex-v8",
      poa_api_version: 1,
      entry: "main.js",
    });
  });
});
