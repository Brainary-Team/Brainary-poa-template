export interface PoaInput {
  message?: string;
}

export interface PoaOutput {
  ok: true;
  message: string;
}

export function run(input: PoaInput = {}): PoaOutput {
  return {
    ok: true,
    message: input.message ?? "Hello from Brainary PoA.",
  };
}

type RuntimeGlobals = typeof globalThis & {
  POA_INPUT?: PoaInput;
  text?: (value: unknown) => void;
};

const runtime = globalThis as RuntimeGlobals;

if (typeof runtime.text === "function") {
  runtime.text(run(runtime.POA_INPUT));
}
