import { describe, expect, it } from "vitest";
import { parseIcsCalendar } from "./parseIcsCalendar";

describe("parseIcsCalendar", () => {
  it("reads events between BEGIN:VEVENT and END:VEVENT", () => {
    expect(
      parseIcsCalendar(`BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20260512T100000
SUMMARY:予定を確認した
END:VEVENT
END:VCALENDAR`),
    ).toEqual([
      {
        dateLabel: "5/12",
        rawTitle: "予定を確認した",
      },
    ]);
  });

  it("reads SUMMARY and DTSTART values", () => {
    const [event] = parseIcsCalendar(`BEGIN:VEVENT
DTSTART;VALUE=DATE:20260513
SUMMARY:人に連絡した
END:VEVENT`);

    expect(event).toMatchObject({
      dateLabel: "5/13",
      rawTitle: "人に連絡した",
    });
  });

  it("unfolds folded lines", () => {
    const [event] = parseIcsCalendar(`BEGIN:VEVENT
DTSTART:20260520T110000
SUMMARY:これは長い予定で内容が
 続いています
END:VEVENT`);

    expect(event.rawTitle).toBe("これは長い予定で内容が続いています");
  });

  it("reads multiple events", () => {
    expect(
      parseIcsCalendar(`BEGIN:VEVENT
DTSTART:20260514T200000
SUMMARY:資料を読んだ
END:VEVENT
BEGIN:VEVENT
DTSTART:20260515T070000
SUMMARY:筋トレ
END:VEVENT`),
    ).toEqual([
      {
        dateLabel: "5/14",
        rawTitle: "資料を読んだ",
      },
      {
        dateLabel: "5/15",
        rawTitle: "筋トレ",
      },
    ]);
  });
});
