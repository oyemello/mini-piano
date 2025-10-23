export type KeyMap = Record<string, string>;

// Base computer-key → note mapping for two octaves around C4.
// We keep this simple and practical per the spec.
export const LOWER_WHITE: ReadonlyArray<readonly [string, string]> = [
  ["z", "C4"],
  ["x", "D4"],
  ["c", "E4"],
  ["v", "F4"],
  ["b", "G4"],
  ["n", "A4"],
  ["m", "B4"],
  [",", "C5"],
  [".", "D5"],
  ["/", "E5"],
] as const;

export const UPPER_WHITE: ReadonlyArray<readonly [string, string]> = [
  ["a", "C5"],
  ["s", "D5"],
  ["d", "E5"],
  ["f", "F5"],
  ["g", "G5"],
  ["h", "A5"],
  ["j", "B5"],
  ["k", "C6"],
  ["l", "D6"],
  [";", "E6"],
] as const;

export const LOWER_BLACK: ReadonlyArray<readonly [string, string]> = [
  ["1", "C#4"],
  ["2", "D#4"],
  ["4", "F#4"],
  ["5", "G#4"],
  ["6", "A#4"],
] as const;

export const UPPER_BLACK: ReadonlyArray<readonly [string, string]> = [
  ["q", "C#5"],
  ["w", "D#5"],
  ["e", "F#5"],
  ["t", "G#5"],
  ["y", "A#5"],
  ["u", "C#6"],
] as const;

export const KEYBOARD_ROWS = {
  lowerWhite: LOWER_WHITE,
  upperWhite: UPPER_WHITE,
  lowerBlack: LOWER_BLACK,
  upperBlack: UPPER_BLACK,
};

export function buildKeyMap(): KeyMap {
  const map: KeyMap = {};
  [...LOWER_WHITE, ...UPPER_WHITE, ...LOWER_BLACK, ...UPPER_BLACK].forEach(
    ([k, n]) => (map[k] = n)
  );
  return map;
}

export const KEY_LEGEND: Array<{ keys: string[]; note: string }> = [
  { keys: ["Z", "A"], note: "C" },
  { keys: ["X", "S"], note: "D" },
  { keys: ["C", "D"], note: "E" },
  { keys: ["V", "F"], note: "F" },
  { keys: ["B", "G"], note: "G" },
  { keys: ["N", "H"], note: "A" },
  { keys: ["M", "J"], note: "B" },
];
