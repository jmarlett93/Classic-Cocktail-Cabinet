import { TestBed } from '@angular/core/testing';

import { buildCatalogBundle } from '../core-services/catalog/catalog-bundle';
import { CABINET_SESSION_STORAGE_KEY } from './cabinet-session.persistence';
import { CabinetStore } from './cabinet-store';

describe('CabinetStore', () => {
  let store: InstanceType<typeof CabinetStore>;
  let validCampariId: string;
  let validVermouthId: string;

  beforeEach(() => {
    sessionStorage.clear();
    const bundle = buildCatalogBundle();
    validCampariId = bundle.bottles.find((b) => b.names[0] === 'Campari')!.id;
    validVermouthId = bundle.bottles.find((b) => b.names[0] === 'Dry Vermouth')!.id;

    TestBed.configureTestingModule({
      providers: [CabinetStore],
    });
    store = TestBed.inject(CabinetStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('rejects unknown bottle ids', () => {
    expect(store.setOwned('bottle-not-in-catalog', true)).toBeFalse();
    expect(store.ownedBottleIds()).toEqual([]);
    expect(store.setFocus('bottle-not-in-catalog')).toBeFalse();
    expect(store.focusBottleId()).toBeNull();
  });

  it('persists owned and focus ids to sessionStorage', () => {
    expect(store.setOwned(validCampariId, true)).toBeTrue();
    expect(store.setFocus(validVermouthId)).toBeTrue();

    const raw = sessionStorage.getItem(CABINET_SESSION_STORAGE_KEY);
    expect(raw).toContain(validCampariId);
    expect(raw).toContain(validVermouthId);
  });

  it('restores state from sessionStorage on init', () => {
    sessionStorage.setItem(
      CABINET_SESSION_STORAGE_KEY,
      JSON.stringify({
        ownedBottleIds: [validCampariId],
        focusBottleId: validVermouthId,
        flavorTerms: ['dry'],
      }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CabinetStore] });
    const restored = TestBed.inject(CabinetStore);

    expect(restored.ownedBottleIds()).toEqual([validCampariId]);
    expect(restored.focusBottleId()).toBe(validVermouthId);
    expect(restored.flavorTerms()).toEqual(['dry']);
  });

  it('exposes effective have-set as owned union focus', () => {
    store.setOwned(validCampariId, true);
    store.setFocus(validVermouthId);
    expect(store.effectiveHaveSet()).toEqual([validCampariId, validVermouthId]);
  });

  it('clears session state', () => {
    store.setOwned(validCampariId, true);
    store.resetSession();
    expect(store.ownedBottleIds()).toEqual([]);
    expect(sessionStorage.getItem(CABINET_SESSION_STORAGE_KEY)).toBeNull();
  });
});
