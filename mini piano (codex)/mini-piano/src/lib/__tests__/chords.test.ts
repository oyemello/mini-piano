import { describe, it, expect } from "vitest";
import { detectChord } from "@/lib/music/chords";

describe("detectChord", () => {
  it("detects major and minor triads", () => {
    expect(detectChord(["C4", "E4", "G4"])?.startsWith("C")).toBe(true);
    expect(detectChord(["A3", "C4", "E4"])?.startsWith("A")).toBe(true);
  });
  it("detects sevenths", () => {
    expect(detectChord(["C4", "E4", "G4", "B4"])).toBe("Cmaj7");
    expect(detectChord(["G3", "B3", "D4", "F4"])).toBe("G7");
  });
});
