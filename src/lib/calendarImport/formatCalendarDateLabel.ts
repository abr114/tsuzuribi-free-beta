export function formatCalendarDateLabel(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "日付なし";
  }

  const compactMatch = trimmedValue.match(/^(\d{4})(\d{2})(\d{2})/);

  if (compactMatch) {
    return `${Number(compactMatch[2])}/${Number(compactMatch[3])}`;
  }

  const isoMatch = trimmedValue.match(/\d{4}-(\d{2})-(\d{2})/);

  if (isoMatch) {
    return `${Number(isoMatch[1])}/${Number(isoMatch[2])}`;
  }

  const slashMatch = trimmedValue.match(/(\d{1,2})[/-](\d{1,2})/);

  if (slashMatch) {
    return `${Number(slashMatch[1])}/${Number(slashMatch[2])}`;
  }

  return trimmedValue.slice(0, 10);
}
