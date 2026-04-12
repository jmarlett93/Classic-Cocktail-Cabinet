/**
 * Pure guard: reject model output that names bottles outside the allowlist.
 * `fullCatalogNames` is the complete SKU list (e.g. all liquors in the app).
 */
export function validateReplyAgainstCatalog(
  text: string,
  allowedNames: ReadonlySet<string>,
  fullCatalogNames: readonly string[],
): { ok: boolean; text: string } {
  for (const name of fullCatalogNames) {
    if (!allowedNames.has(name) && text.includes(name)) {
      return { ok: false, text: '' };
    }
  }
  return { ok: true, text };
}
