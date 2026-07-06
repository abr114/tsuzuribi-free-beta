import { describe, expect, it } from "vitest";
import { parseCsvCalendar } from "./parseCsvCalendar";

describe("parseCsvCalendar", () => {
  it("reads a normal CSV", () => {
    expect(parseCsvCalendar("title,date\n予定を確認した,2026-05-12")).toEqual([
      {
        dateLabel: "5/12",
        rawTitle: "予定を確認した",
      },
    ]);
  });

  it("reads quoted CSV cells", () => {
    expect(parseCsvCalendar('title,date\n"人に連絡した","2026-05-13"')).toEqual([
      {
        dateLabel: "5/13",
        rawTitle: "人に連絡した",
      },
    ]);
  });

  it("keeps commas inside quoted titles", () => {
    expect(
      parseCsvCalendar('title,date\n"資料, メモを整理した",2026-05-12'),
    ).toEqual([
      {
        dateLabel: "5/12",
        rawTitle: "資料, メモを整理した",
      },
    ]);
  });

  it("reads Japanese title and start-date headers", () => {
    expect(parseCsvCalendar("タイトル,開始日\n資料を読んだ,2026-05-14")).toEqual([
      {
        dateLabel: "5/14",
        rawTitle: "資料を読んだ",
      },
    ]);
  });

  it("reads English title and date-like headers", () => {
    expect(parseCsvCalendar("Title,Start Date\n筋トレ,2026-05-15")).toEqual([
      {
        dateLabel: "5/15",
        rawTitle: "筋トレ",
      },
    ]);
  });

  it("reads title and date headers with a UTF-8 BOM", () => {
    expect(parseCsvCalendar("\uFEFFtitle,date\n予定を確認した,2026-05-12")).toEqual([
      {
        dateLabel: "5/12",
        rawTitle: "予定を確認した",
      },
    ]);
  });

  it("reads Japanese titles with a UTF-8 BOM", () => {
    const [event] = parseCsvCalendar("\uFEFFtitle,date\n資料を読んだ,2026-05-14");

    expect(event.rawTitle).toBe("資料を読んだ");
  });

  it("reads Japanese headers with a UTF-8 BOM", () => {
    expect(parseCsvCalendar("\uFEFFタイトル,開始日\n筋トレ,2026-05-15")).toEqual([
      {
        dateLabel: "5/15",
        rawTitle: "筋トレ",
      },
    ]);
  });

  it("keeps title rows without dates as parsed entries", () => {
    expect(parseCsvCalendar("title,date\nなななな,")).toEqual([
      {
        dateLabel: "日付なし",
        rawTitle: "なななな",
      },
    ]);
  });

  it("ignores rows that are only empty cells", () => {
    expect(parseCsvCalendar("title,date\n,\n\n予定を確認した,2026-05-12")).toEqual([
      {
        dateLabel: "5/12",
        rawTitle: "予定を確認した",
      },
    ]);
  });
});
