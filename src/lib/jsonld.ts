// Safe serialization for JSON-LD injected via dangerouslySetInnerHTML.
// JSON.stringify does NOT neutralize `</script>`, so editor-controlled content
// could break out of the <script> tag and execute (stored XSS). Escape the
// characters that matter inside a <script> context and in JSON string literals.
// U+2028/U+2029 are valid in JSON strings but break inline scripts, so escape
// them too (matched via \u escapes so no literal separator lands in this file).
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/[\u2028]/g, '\\u2028')
    .replace(/[\u2029]/g, '\\u2029')
}
