import { describe, expect, it } from "vitest";
import { run } from "../src/main.js";

describe("PoA business logic", () => {
  it("returns the supplied message", () => {
    expect(run({ message: "hello" })).toEqual({
      ok: true,
      message: "hello",
    });
  });

  it("uses the default message when input is omitted", () => {
    expect(run()).toEqual({
      ok: true,
      message: "Hello from Brainary PoA.",
    });
  });
});
