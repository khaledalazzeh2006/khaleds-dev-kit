import { matchesHotkey } from "./hotkeys";

const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

describe("matchesHotkey", () => {
  it("maps mod to Ctrl on Windows", () => {
    expect(matchesHotkey(key({ key: "k", ctrlKey: true }), "mod+k", false)).toBe(true);
    expect(matchesHotkey(key({ key: "k", metaKey: true }), "mod+k", false)).toBe(false);
  });

  it("maps mod to Cmd on macOS", () => {
    expect(matchesHotkey(key({ key: "k", metaKey: true }), "mod+k", true)).toBe(true);
    expect(matchesHotkey(key({ key: "k", ctrlKey: true }), "mod+k", true)).toBe(false);
  });

  it("requires exact modifiers", () => {
    expect(matchesHotkey(key({ key: "/" }), "/", false)).toBe(true);
    expect(matchesHotkey(key({ key: "/", ctrlKey: true }), "/", false)).toBe(false);
    expect(matchesHotkey(key({ key: "K", ctrlKey: true, shiftKey: true }), "mod+k", false)).toBe(
      false,
    );
  });
});
