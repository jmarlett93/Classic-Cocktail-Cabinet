import meta from '../../../../data/meta.json';
import dimensionsJson from '../../../../data/flavor-dimensions.json';
import taxonomiesJson from '../../../../data/taxonomies.json';
import notesJson from '../../../../data/notes.json';
import synonymsJson from '../../../../data/taste-synonyms.json';
import staplesJson from '../../../../data/staples.json';
import recipesJson from '../../../../data/recipes.json';

import {
  CatalogBundle,
  CatalogMeta,
  DrinkRecord,
  FlavorDimensionDef,
  FlavorNote,
  StapleRecord,
  TasteSynonym,
  Taxonomies,
} from '../../models/catalog-types';
import { migrateLegacyLiquors } from './liquor-to-bottle-migration';

let cachedBundle: CatalogBundle | undefined;

export function loadCatalogBundle(): CatalogBundle {
  if (cachedBundle) {
    return cachedBundle;
  }

  cachedBundle = {
    meta: meta as CatalogMeta,
    dimensions: dimensionsJson as FlavorDimensionDef[],
    taxonomies: taxonomiesJson as Taxonomies,
    notes: notesJson as FlavorNote[],
    synonyms: synonymsJson as TasteSynonym[],
    bottles: migrateLegacyLiquors(),
    staples: staplesJson as StapleRecord[],
    drinks: recipesJson as DrinkRecord[],
  };

  return cachedBundle;
}

/** Test helper — bypass singleton cache. */
export function buildCatalogBundle(): CatalogBundle {
  return {
    meta: meta as CatalogMeta,
    dimensions: dimensionsJson as FlavorDimensionDef[],
    taxonomies: taxonomiesJson as Taxonomies,
    notes: notesJson as FlavorNote[],
    synonyms: synonymsJson as TasteSynonym[],
    bottles: migrateLegacyLiquors(),
    staples: staplesJson as StapleRecord[],
    drinks: recipesJson as DrinkRecord[],
  };
}

export function clearCatalogBundleCache(): void {
  cachedBundle = undefined;
}
