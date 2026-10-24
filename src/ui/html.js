/** Escape authored strings at the HTML boundary, including attribute values.
 * This is text escaping, not an HTML sanitizer or a URL allow-list. Content
 * modules are trusted local source; do not pass arbitrary remote HTML here.
 */
export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
}
