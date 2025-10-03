// utils/text.ts
export function cleanForecastText(raw?: string): string {
  if (!raw) return "";
  // turn CRLF -> LF and literal "\n" -> real newline
  let s = raw.replace(/\r\n/g, "\n").replace(/\\n/g, "\n");

  // collapse 3+ newlines to double (paragraphs)
  s = s.replace(/\n{3,}/g, "\n\n");

  // unwrap single newlines inside paragraphs → spaces
  s = s
      .split(/\n{2,}/)                            // paragraphs
      .map(p => p.replace(/\s*\n\s*/g, " ")       // unwrap soft breaks
          .replace(/\s{2,}/g, " ")         // tidy spaces
          .trim())
      .join("\n\n");

  // optional: convert "..." to ellipsis
  s = s.replace(/\.\.\./g, "…");

  return s.trim();
}
