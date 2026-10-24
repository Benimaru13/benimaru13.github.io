/** Derive a greeting from time rather than accumulating timer ticks.
 * Array.from preserves surrogate pairs. Slots type, hold, then erase.
 * Empty input is supported so editing content cannot crash the render loop.
 */
export function greetingAt(elapsed, greetings) {
  if (!greetings.length) return { language: "en", text: "" };
  const time = Math.max(0, elapsed);
  const [language, phrase] =
    greetings[Math.floor(time / 3000) % greetings.length];
  const letters = Array.from(phrase);
  const phase = time % 3000;
  const count =
    phase < 900
      ? Math.ceil((phase / 900) * letters.length)
      : phase > 2750
        ? Math.ceil(((3000 - phase) / 250) * letters.length)
        : letters.length;
  return { language, text: letters.slice(0, count).join("") };
}
