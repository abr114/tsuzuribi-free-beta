import { describe, expect, it } from "vitest";
import { classifyCalendarTitle } from "./classifyCalendarEntry";
import { decodeCsvCalendarBuffer } from "./decodeCalendarText";
import { parseCsvCalendar } from "./parseCsvCalendar";

const canDecodeShiftJis = (() => {
  try {
    new TextDecoder("shift_jis");
    return true;
  } catch {
    return false;
  }
})();

describe("decodeCsvCalendarBuffer", () => {
  it.runIf(canDecodeShiftJis)(
    "decodes Shift_JIS bytes and keeps Japanese titles classifiable",
    () => {
      const shiftJisCsv = new Uint8Array([
        0x74, 0x69, 0x74, 0x6c, 0x65, 0x2c, 0x64, 0x61, 0x74, 0x65, 0x0a,
        0x97, 0x5c, 0x92, 0xe8, 0x8a, 0x6d, 0x94, 0x46, 0x2c, 0x32, 0x30,
        0x32, 0x36, 0x2d, 0x30, 0x35, 0x2d, 0x31, 0x32,
      ]);

      const decoded = decodeCsvCalendarBuffer(
        shiftJisCsv.buffer,
        "shift_jis",
      );
      const [event] = parseCsvCalendar(decoded.text);

      expect(decoded.encoding).toBe("shift_jis");
      expect(event.rawTitle).toBe("予定確認");
      expect(classifyCalendarTitle(event.rawTitle)).toMatchObject({
        category: "future",
        confidence: "high",
      });
    },
  );

  it.runIf(canDecodeShiftJis)(
    "falls back to Shift_JIS when auto decoding sees likely mojibake",
    () => {
      const shiftJisCsv = new Uint8Array([
        0x74, 0x69, 0x74, 0x6c, 0x65, 0x2c, 0x64, 0x61, 0x74, 0x65, 0x0a,
        0x8e, 0x91, 0x97, 0xbf, 0x2c, 0x32, 0x30, 0x32, 0x36, 0x2d, 0x30,
        0x35, 0x2d, 0x31, 0x34,
      ]);

      const decoded = decodeCsvCalendarBuffer(shiftJisCsv.buffer, "auto");
      const [event] = parseCsvCalendar(decoded.text);

      expect(decoded.encoding).toBe("shift_jis");
      expect(event.rawTitle).toBe("資料");
      expect(classifyCalendarTitle(event.rawTitle)).toMatchObject({
        category: "build",
        confidence: "high",
      });
    },
  );
});
