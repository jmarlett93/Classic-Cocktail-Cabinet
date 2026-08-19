/** Shared catalog types for two-modal discovery (type-level bottles, drinks, staples, vocabulary). */

export type FlavorSpace = 'v1';

export type FlavorWeights = Partial<Record<FlavorDimensionId, number>>;

export type FlavorDimensionId =
  | 'sweet'
  | 'sour'
  | 'bitter'
  | 'dry'
  | 'salty'
  | 'citrus'
  | 'herbal'
  | 'floral'
  | 'fruity'
  | 'spicy'
  | 'smoky'
  | 'earthy'
  | 'nutty'
  | 'oak'
  | 'bright'
  | 'rich'
  | 'hot'
  | 'creamy';

export interface CatalogMeta {
  schemaVersion: number;
  flavorSpace: FlavorSpace;
}

export interface FlavorDimensionDef {
  id: FlavorDimensionId;
  label: string;
  flavorClass: 'balance' | 'aromatic' | 'impression' | 'texture';
}

export interface Taxonomies {
  bottleKind: readonly string[];
  spiritFamily: readonly string[];
  typicalRole: readonly string[];
  drinkFamily: readonly string[];
  method: readonly string[];
  glass: readonly string[];
  ingredientRole: readonly string[];
  stapleKind: readonly string[];
}

export interface FlavorNote {
  id: string;
  label: string;
  profile: FlavorWeights;
}

export interface TasteSynonym {
  id: string;
  terms: string[];
  profile: FlavorWeights;
  noteIds?: string[];
  kind?: 'dimension' | 'impression' | 'note' | 'slang';
}

export interface BottleRecord {
  id: string;
  schemaVersion: number;
  flavorSpace: FlavorSpace;
  names: string[];
  description: string;
  brand?: string;
  kind: string;
  spiritFamily: string;
  typicalRole: string;
  flavor: FlavorWeights;
  noteIds?: string[];
  countsForUnlock: true;
}

export interface StapleRecord {
  id: string;
  schemaVersion: number;
  flavorSpace: FlavorSpace;
  names: string[];
  stapleKind: string;
  countsForUnlock: false;
  flavor?: FlavorWeights;
}

export type ComponentKind = 'bottle' | 'staple';

export interface DrinkIngredient {
  componentKind: ComponentKind;
  componentId: string;
  role: string;
  amountMl: number;
}

export interface DrinkGarnish {
  stapleId: string;
  method: string;
}

export interface DrinkFlavorAuthored {
  authored: FlavorWeights;
  composeRule: 'v1';
}

export interface DrinkRecord {
  id: string;
  schemaVersion: number;
  flavorSpace: FlavorSpace;
  names: string[];
  description: string;
  drinkFamily: string;
  method: string;
  glass: string;
  ingredients: DrinkIngredient[];
  garnish?: DrinkGarnish;
  instructions: string;
  flavor: DrinkFlavorAuthored;
}

export interface CatalogBundle {
  meta: CatalogMeta;
  dimensions: FlavorDimensionDef[];
  taxonomies: Taxonomies;
  notes: FlavorNote[];
  synonyms: TasteSynonym[];
  bottles: BottleRecord[];
  staples: StapleRecord[];
  drinks: DrinkRecord[];
}

export interface CatalogIntegrityViolation {
  rule: string;
  message: string;
  entityId?: string;
}

export interface CatalogIntegrityResult {
  ok: boolean;
  violations: CatalogIntegrityViolation[];
}
