declare global {
  /** Input supplied by the Brainary Runtime for the current PoA run. */
  const POA_INPUT: unknown;

  /** Writes a value to the PoA result stream. */
  function text(value: unknown): void;

  /** Runtime-provided tool lookup. */
  const tools: Record<string, unknown>;

  /** Runtime-provided tool inventory. */
  const ALL_TOOLS: readonly string[];
}

export {};
