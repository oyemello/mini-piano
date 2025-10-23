import { describe, it, expect } from "vitest";
import { buildKeyMap } from "@/lib/keys/mapping";

describe("buildKeyMap", () => {
  it("maps letters to expected notes", () => {
    const m = buildKeyMap();
    expect(m["z"]).toBe("C4");
    expect(m[", ".trim()]).toBe("C5");
    expect(m["a"]).toBe("C5");
    expect(m["k"]).toBe("C6");
  });
  it("maps black keys", () => {
    const m = buildKeyMap();
    expect(m["1"]).toBe("C#4");
    expect(m["w"]).toBe("D#5");
  });
});

