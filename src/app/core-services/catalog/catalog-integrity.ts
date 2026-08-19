import {
  CatalogBundle,
  CatalogIntegrityResult,
  CatalogIntegrityViolation,
  DrinkRecord,
  FlavorWeights,
} from '../../models/catalog-types';
import { isFlavorDimensionId } from '../../models/flavor-dimensions';

const KNOWN_COMPOSE_RULES = new Set(['v1']);

function casefold(value: string): string {
  return value.trim().toLowerCase();
}

function pushViolation(
  violations: CatalogIntegrityViolation[],
  rule: string,
  message: string,
  entityId?: string,
): void {
  violations.push({ rule, message, entityId });
}

function validateFlavorMap(
  violations: CatalogIntegrityViolation[],
  rule: string,
  flavor: FlavorWeights | undefined,
  entityId: string,
  label: string,
): void {
  if (!flavor) {
    return;
  }
  for (const [key, value] of Object.entries(flavor)) {
    if (!isFlavorDimensionId(key)) {
      pushViolation(
        violations,
        rule,
        `${label} uses unknown flavor dimension "${key}"`,
        entityId,
      );
      continue;
    }
    if (typeof value !== 'number' || value <= 0 || value > 1) {
      pushViolation(
        violations,
        rule,
        `${label} weight for "${key}" must be in (0, 1], got ${value}`,
        entityId,
      );
    }
  }
}

function assertUniqueIds(
  violations: CatalogIntegrityViolation[],
  ids: string[],
  entityLabel: string,
): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      pushViolation(violations, 'unique-ids', `Duplicate ${entityLabel} id "${id}"`, id);
    }
    seen.add(id);
  }
}

function assertUniqueNamesCasefold(
  violations: CatalogIntegrityViolation[],
  namesList: string[][],
  entityLabel: string,
): void {
  const seen = new Set<string>();
  for (const names of namesList) {
    for (const name of names) {
      const key = casefold(name);
      if (seen.has(key)) {
        pushViolation(
          violations,
          'unique-names',
          `Duplicate ${entityLabel} name "${name}" after casefold`,
          names[0],
        );
      }
      seen.add(key);
    }
  }
}

function unlockBottleIds(drink: DrinkRecord, bottleIds: Set<string>): string[] {
  return drink.ingredients
    .filter((row) => row.componentKind === 'bottle' && bottleIds.has(row.componentId))
    .map((row) => row.componentId);
}

export function validateCatalogIntegrity(bundle: CatalogBundle): CatalogIntegrityResult {
  const violations: CatalogIntegrityViolation[] = [];
  const bottleIdList = bundle.bottles.map((b) => b.id);
  const stapleIdList = bundle.staples.map((s) => s.id);
  const drinkIdList = bundle.drinks.map((d) => d.id);
  const noteIdList = bundle.notes.map((n) => n.id);
  const noteIds = new Set(noteIdList);
  const bottleIds = new Set(bottleIdList);
  const stapleIds = new Set(stapleIdList);
  const drinkIds = new Set(drinkIdList);
  const allEntityIds = new Set<string>();

  for (const id of [...bottleIds, ...stapleIds, ...drinkIds, ...noteIds]) {
    if (allEntityIds.has(id)) {
      pushViolation(violations, 'cross-file-ids', `Cross-file id collision on "${id}"`, id);
    }
    allEntityIds.add(id);
  }

  assertUniqueIds(violations, bottleIdList, 'bottle');
  assertUniqueIds(violations, stapleIdList, 'staple');
  assertUniqueIds(violations, drinkIdList, 'drink');
  assertUniqueIds(violations, noteIdList, 'note');
  assertUniqueIds(violations, bundle.synonyms.map((s) => s.id), 'synonym');

  if (bundle.meta.flavorSpace !== 'v1') {
    pushViolation(violations, 'flavor-space', `Unsupported flavorSpace "${bundle.meta.flavorSpace}"`);
  }

  const synonymTerms = new Set<string>();
  for (const synonym of bundle.synonyms) {
    if (!synonym.profile || Object.keys(synonym.profile).length === 0) {
      pushViolation(violations, 'synonym-profile', 'Synonym profile must be non-empty', synonym.id);
    }
    validateFlavorMap(violations, 'synonym-flavor', synonym.profile, synonym.id, 'Synonym profile');
    for (const term of synonym.terms) {
      const key = casefold(term);
      if (synonymTerms.has(key)) {
        pushViolation(violations, 'synonym-terms', `Duplicate synonym term "${term}"`, synonym.id);
      }
      synonymTerms.add(key);
    }
    for (const noteId of synonym.noteIds ?? []) {
      if (!noteIds.has(noteId)) {
        pushViolation(violations, 'synonym-notes', `Unknown noteId "${noteId}"`, synonym.id);
      }
    }
  }

  for (const note of bundle.notes) {
    validateFlavorMap(violations, 'note-flavor', note.profile, note.id, 'Note profile');
  }

  assertUniqueNamesCasefold(
    violations,
    bundle.bottles.map((b) => b.names),
    'bottle',
  );
  assertUniqueNamesCasefold(
    violations,
    bundle.staples.map((s) => s.names),
    'staple',
  );
  assertUniqueNamesCasefold(
    violations,
    bundle.drinks.map((d) => d.names),
    'drink',
  );

  for (const bottle of bundle.bottles) {
    if (bottle.schemaVersion !== bundle.meta.schemaVersion || bottle.flavorSpace !== bundle.meta.flavorSpace) {
      pushViolation(
        violations,
        'schema-meta',
        'Bottle schemaVersion/flavorSpace must match meta',
        bottle.id,
      );
    }
    if (!bottle.names[0]?.trim()) {
      pushViolation(violations, 'display-name', 'Bottle missing display name', bottle.id);
    }
    if (!bottle.description?.trim()) {
      pushViolation(violations, 'description', 'Bottle description required', bottle.id);
    }
    if (bottle.countsForUnlock !== true) {
      pushViolation(violations, 'bottle-unlock-flag', 'Bottles must have countsForUnlock: true', bottle.id);
    }
    if (!bundle.taxonomies.bottleKind.includes(bottle.kind)) {
      pushViolation(violations, 'taxonomy', `Invalid bottle kind "${bottle.kind}"`, bottle.id);
    }
    if (!bundle.taxonomies.spiritFamily.includes(bottle.spiritFamily)) {
      pushViolation(violations, 'taxonomy', `Invalid spiritFamily "${bottle.spiritFamily}"`, bottle.id);
    }
    if (!bundle.taxonomies.typicalRole.includes(bottle.typicalRole)) {
      pushViolation(violations, 'taxonomy', `Invalid typicalRole "${bottle.typicalRole}"`, bottle.id);
    }
    validateFlavorMap(violations, 'bottle-flavor', bottle.flavor, bottle.id, 'Bottle flavor');
    if (Object.keys(bottle.flavor).length === 0) {
      pushViolation(violations, 'bottle-flavor', 'Bottle flavor map must be non-empty', bottle.id);
    }
    for (const noteId of bottle.noteIds ?? []) {
      if (!noteIds.has(noteId)) {
        pushViolation(violations, 'bottle-notes', `Unknown noteId "${noteId}"`, bottle.id);
      }
    }
  }

  for (const staple of bundle.staples) {
    if (staple.countsForUnlock !== false) {
      pushViolation(
        violations,
        'staple-unlock-flag',
        'Staples must have countsForUnlock: false',
        staple.id,
      );
    }
    if (!bundle.taxonomies.stapleKind.includes(staple.stapleKind)) {
      pushViolation(violations, 'taxonomy', `Invalid stapleKind "${staple.stapleKind}"`, staple.id);
    }
    validateFlavorMap(violations, 'staple-flavor', staple.flavor, staple.id, 'Staple flavor');
  }

  for (const drink of bundle.drinks) {
    if (!drink.description?.trim()) {
      pushViolation(violations, 'description', 'Drink description required', drink.id);
    }
    if (!drink.instructions?.trim()) {
      pushViolation(violations, 'instructions', 'Drink instructions required', drink.id);
    }
    if (!bundle.taxonomies.drinkFamily.includes(drink.drinkFamily)) {
      pushViolation(violations, 'taxonomy', `Invalid drinkFamily "${drink.drinkFamily}"`, drink.id);
    }
    if (!bundle.taxonomies.method.includes(drink.method)) {
      pushViolation(violations, 'taxonomy', `Invalid method "${drink.method}"`, drink.id);
    }
    if (!bundle.taxonomies.glass.includes(drink.glass)) {
      pushViolation(violations, 'taxonomy', `Invalid glass "${drink.glass}"`, drink.id);
    }
    if (!KNOWN_COMPOSE_RULES.has(drink.flavor.composeRule)) {
      pushViolation(
        violations,
        'compose-rule',
        `Unknown composeRule "${drink.flavor.composeRule}"`,
        drink.id,
      );
    }
    validateFlavorMap(
      violations,
      'drink-authored-flavor',
      drink.flavor.authored,
      drink.id,
      'Drink authored flavor',
    );

    const flavorRecord = drink.flavor as unknown as Record<string, unknown>;
    const forbiddenKeys = ['inherited', 'composed'] as const;
    for (const key of forbiddenKeys) {
      if (key in flavorRecord) {
        pushViolation(
          violations,
          'derived-flavor-persisted',
          `Drink must not persist derived flavor key "${key}"`,
          drink.id,
        );
      }
    }

    for (const row of drink.ingredients) {
      if (!bundle.taxonomies.ingredientRole.includes(row.role)) {
        pushViolation(violations, 'taxonomy', `Invalid ingredient role "${row.role}"`, drink.id);
      }
      if (row.amountMl <= 0) {
        pushViolation(violations, 'amount', 'Ingredient amountMl must be positive', drink.id);
      }
      if (row.componentKind === 'bottle') {
        if (!bottleIds.has(row.componentId)) {
          pushViolation(
            violations,
            'component-resolution',
            `Missing bottle "${row.componentId}"`,
            drink.id,
          );
        }
      } else if (row.componentKind === 'staple') {
        if (!stapleIds.has(row.componentId)) {
          pushViolation(
            violations,
            'component-resolution',
            `Missing staple "${row.componentId}"`,
            drink.id,
          );
        }
      } else {
        pushViolation(
          violations,
          'component-kind',
          `Unknown componentKind "${row.componentKind as string}"`,
          drink.id,
        );
      }
    }

    if (drink.garnish && !stapleIds.has(drink.garnish.stapleId)) {
      pushViolation(
        violations,
        'garnish-resolution',
        `Missing garnish staple "${drink.garnish.stapleId}"`,
        drink.id,
      );
    }

    const unlockIds = unlockBottleIds(drink, bottleIds);
    if (unlockIds.length === 0) {
      pushViolation(
        violations,
        'unlock-bottle',
        'Every drink must reference at least one unlock bottle',
        drink.id,
      );
    }
  }

  for (const collectableId of bottleIds) {
    const bottle = bundle.bottles.find((b) => b.id === collectableId);
    if (!bottle || Object.keys(bottle.flavor).length === 0) {
      pushViolation(
        violations,
        'collectable-weighted',
        `Collection-eligible id "${collectableId}" missing weighted bottle record`,
        collectableId,
      );
    }
  }

  return { ok: violations.length === 0, violations };
}

export function assertCatalogIntegrity(bundle: CatalogBundle): void {
  const result = validateCatalogIntegrity(bundle);
  if (!result.ok) {
    const summary = result.violations
      .slice(0, 5)
      .map((v) => `${v.rule}: ${v.message}`)
      .join('; ');
    throw new Error(`Catalog integrity failed (${result.violations.length} violations): ${summary}`);
  }
}
