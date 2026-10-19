type RuntimeTool = (input?: unknown) => Promise<unknown>;

type RuntimeToolMetadata = {
  name: string;
  description: string;
};

type RuntimeImageDetail = "auto" | "low" | "high" | "original" | null;

type RuntimeImageInput =
  | string
  | {
      image_url: string;
      detail?: RuntimeImageDetail;
    }
  | {
      type: "image";
      data: string;
      mimeType: string;
    };

type RuntimeAudioInput =
  | string
  | {
      audio_url: string;
    }
  | {
      type: "audio";
      data: string;
      mimeType: string;
    };

type RuntimeGeneratedImage = {
  image_url: string;
  output_hint?: string;
};

type RuntimeAskQuestion = {
  question: string;
  options?: readonly {
    label: string;
    description?: string;
  }[];
};

type RuntimeAskInput = {
  questions: readonly RuntimeAskQuestion[];
};

declare global {
  /** Input supplied by the Brainary Runtime for the current PoA run. */
  const POA_INPUT: unknown;

  /** Writes a value to the PoA result stream. */
  function text(value: unknown): void;

  /** Appends an image to the PoA result stream. */
  function image(
    imageUrlOrItem: RuntimeImageInput,
    detail?: RuntimeImageDetail,
  ): void;

  /** Appends audio to the PoA result stream. */
  function audio(audioUrlOrItem: RuntimeAudioInput): void;

  /** Appends an image-generation result to the PoA result stream. */
  function generatedImage(result: RuntimeGeneratedImage): void;

  /** Stores a serializable value for later calls in the same session. */
  function store(key: string, value: unknown): void;

  /** Loads a value stored earlier in the same session. */
  function load<T = unknown>(key: string): T | undefined;

  /** Emits an additional result immediately. */
  function notify(value: unknown): void;

  /** Yields the current output while keeping the PoA running. */
  function yield_control(): void;

  /** Stops the current PoA successfully. */
  function exit(): void;

  /** Requests input when the host allows interactive questions. */
  const ask: ((input: RuntimeAskInput) => Promise<unknown>) | undefined;

  /** Runtime-provided tool lookup. */
  const tools: Record<string, RuntimeTool>;

  /** Runtime-provided tool inventory. */
  const ALL_TOOLS: readonly RuntimeToolMetadata[];
}

export {};
