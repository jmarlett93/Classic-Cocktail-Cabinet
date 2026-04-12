import { validateReplyAgainstCatalog } from './catalog-guard';

describe('validateReplyAgainstCatalog (agents)', () => {
  const catalog = ['Gin', 'Vodka', 'Baileys Irish Cream', 'Campari'];

  it('rejects text that mentions a catalog bottle not in the allowlist', () => {
    const allowed = new Set(['Gin', 'Vodka']);
    const bad = validateReplyAgainstCatalog('Try Gin and also Baileys Irish Cream tonight.', allowed, catalog);
    expect(bad.ok).toBe(false);
  });

  it('accepts text that only mentions allowed bottles', () => {
    const allowed = new Set(['Gin', 'Campari']);
    const good = validateReplyAgainstCatalog('Gin and Campari would work well here.', allowed, catalog);
    expect(good.ok).toBe(true);
  });
});
