import type {
  CalendarTextEncoding,
  ResolvedCalendarTextEncoding,
} from "./calendarImportTypes";

type DecodeCalendarTextResult = {
  encoding: ResolvedCalendarTextEncoding;
  text: string;
};

const mojibakeMarkers = [
  "繧",
  "譁",
  "縺",
  "莠",
  "謗",
  "髯",
  "隕",
  "譚",
  "荳",
  "逕",
  "蜿",
  "邱",
  "螟",
];

export function decodeCsvCalendarBuffer(
  buffer: ArrayBuffer,
  encoding: CalendarTextEncoding,
): DecodeCalendarTextResult {
  if (encoding === "utf-8") {
    return {
      encoding,
      text: decodeText(buffer, "utf-8"),
    };
  }

  if (encoding === "shift_jis") {
    return {
      encoding,
      text: decodeText(buffer, "shift_jis"),
    };
  }

  const utf8Text = decodeText(buffer, "utf-8");

  if (hasLikelyMojibake(utf8Text)) {
    return {
      encoding: "shift_jis",
      text: decodeText(buffer, "shift_jis"),
    };
  }

  return {
    encoding: "utf-8",
    text: utf8Text,
  };
}

export function decodeIcsCalendarBuffer(
  buffer: ArrayBuffer,
): DecodeCalendarTextResult {
  return {
    encoding: "utf-8",
    text: decodeText(buffer, "utf-8"),
  };
}

export function stripTextBom(text: string) {
  return text.replace(/^\uFEFF/, "");
}

export function hasLikelyMojibake(text: string) {
  const replacementCount = countMatches(text, /\uFFFD/g);
  const markerCount = mojibakeMarkers.reduce(
    (count, marker) => count + countOccurrences(text, marker),
    0,
  );
  const textLength = Math.max([...text].length, 1);

  return (
    replacementCount >= 2 ||
    replacementCount / textLength > 0.01 ||
    markerCount >= 2
  );
}

function decodeText(buffer: ArrayBuffer, encoding: ResolvedCalendarTextEncoding) {
  return stripTextBom(new TextDecoder(encoding).decode(buffer));
}

function countMatches(text: string, pattern: RegExp) {
  return text.match(pattern)?.length ?? 0;
}

function countOccurrences(text: string, marker: string) {
  return text.split(marker).length - 1;
}
