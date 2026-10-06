// Mobile numbers are stored in E.164 with +962 (Jordan) as the default country.
export const E164_RE = /^\+[1-9]\d{7,14}$/;

export function toE164(input: string, defaultCc = "962") {
  const d = input.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d;
  if (d.startsWith("00")) return `+${d.slice(2)}`;
  if (d.startsWith("0")) return `+${defaultCc}${d.slice(1)}`;
  return d.startsWith(defaultCc) ? `+${d}` : `+${defaultCc}${d}`;
}
