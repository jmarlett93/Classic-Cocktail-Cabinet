import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { loadCatalogBundle } from '../../core-services/catalog/catalog-bundle';
import { resolveFlavorQuery } from '../../core-services/discovery/flavor-query';
import { CabinetStore } from '../../stores/cabinet-store';

interface CatalogBottleOption {
  id: string;
  displayName: string;
  family: string;
}

interface BottleFamilyGroup {
  family: string;
  bottles: CatalogBottleOption[];
}

@Component({
  selector: 'clsc-cabinet-collection',
  imports: [FormsModule, RouterLink],
  templateUrl: './cabinet-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabinetCollectionComponent implements OnInit {
  readonly cabinet = inject(CabinetStore);
  readonly bottleQuery = signal('');

  readonly bottles = computed<CatalogBottleOption[]>(() =>
    loadCatalogBundle()
      .bottles.map((bottle) => ({
        id: bottle.id,
        displayName: bottle.names[0] ?? bottle.id,
        family: this.formatFamily(bottle.spiritFamily),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
  );

  readonly filteredBottles = computed(() => {
    const q = this.bottleQuery().trim().toLowerCase();
    if (!q) {
      return this.bottles();
    }
    return this.bottles().filter((bottle) =>
      `${bottle.displayName} ${bottle.family}`.toLowerCase().includes(q),
    );
  });

  readonly bottleGroups = computed<BottleFamilyGroup[]>(() => {
    const groups = new Map<string, CatalogBottleOption[]>();
    for (const bottle of this.filteredBottles()) {
      groups.set(bottle.family, [...(groups.get(bottle.family) ?? []), bottle]);
    }
    return Array.from(groups.entries())
      .map(([family, bottles]) => ({ family, bottles }))
      .sort((a, b) => a.family.localeCompare(b.family));
  });

  readonly effectiveHaveSet = this.cabinet.effectiveHaveSet;
  readonly ownedCount = computed(() => this.cabinet.ownedBottleIds().length);

  flavorTermsInput = '';

  ngOnInit(): void {
    this.syncFlavorTermsInput();
  }

  syncFlavorTermsInput(): void {
    this.flavorTermsInput = this.cabinet.flavorTerms().join(', ');
  }

  onOwnedChange(bottleId: string, checked: boolean): void {
    this.cabinet.setOwned(bottleId, checked);
  }

  setBottleQuery(value: string): void {
    this.bottleQuery.set(value);
  }

  applyFlavorTerms(): void {
    const terms = this.flavorTermsInput
      .split(',')
      .map((term) => term.trim())
      .filter((term) => term.length > 0);
    this.cabinet.setFlavorTerms(terms);
    const vector = resolveFlavorQuery(terms.join(' and '), loadCatalogBundle().synonyms);
    this.cabinet.setFlavorVector(vector);
  }

  clearSession(): void {
    this.cabinet.resetSession();
    this.flavorTermsInput = '';
  }

  familyDomId(family: string): string {
    return `cabinet-family-${family.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  private formatFamily(value: string): string {
    return value
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
