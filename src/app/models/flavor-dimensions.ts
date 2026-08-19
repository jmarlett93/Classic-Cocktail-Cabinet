import { FlavorDimensionDef, FlavorDimensionId } from './catalog-types';

/** Frozen v1 flavor axes (PROP-vocab-v1 / Dataset design §4). */
export const FLAVOR_DIMENSIONS_V1: readonly FlavorDimensionDef[] = [
  { id: 'sweet', label: 'Sweet', flavorClass: 'balance' },
  { id: 'sour', label: 'Sour', flavorClass: 'balance' },
  { id: 'bitter', label: 'Bitter', flavorClass: 'balance' },
  { id: 'dry', label: 'Dry', flavorClass: 'balance' },
  { id: 'salty', label: 'Salty', flavorClass: 'balance' },
  { id: 'citrus', label: 'Citrus', flavorClass: 'aromatic' },
  { id: 'herbal', label: 'Herbal', flavorClass: 'aromatic' },
  { id: 'floral', label: 'Floral', flavorClass: 'aromatic' },
  { id: 'fruity', label: 'Fruity', flavorClass: 'aromatic' },
  { id: 'spicy', label: 'Spicy', flavorClass: 'aromatic' },
  { id: 'smoky', label: 'Smoky', flavorClass: 'aromatic' },
  { id: 'earthy', label: 'Earthy', flavorClass: 'aromatic' },
  { id: 'nutty', label: 'Nutty', flavorClass: 'aromatic' },
  { id: 'oak', label: 'Oak', flavorClass: 'aromatic' },
  { id: 'bright', label: 'Bright', flavorClass: 'impression' },
  { id: 'rich', label: 'Rich', flavorClass: 'impression' },
  { id: 'hot', label: 'Hot', flavorClass: 'impression' },
  { id: 'creamy', label: 'Creamy', flavorClass: 'texture' },
] as const;

export const FLAVOR_DIMENSION_IDS_V1: readonly FlavorDimensionId[] = FLAVOR_DIMENSIONS_V1.map(
  (d) => d.id,
);

export function isFlavorDimensionId(value: string): value is FlavorDimensionId {
  return (FLAVOR_DIMENSION_IDS_V1 as readonly string[]).includes(value);
}
