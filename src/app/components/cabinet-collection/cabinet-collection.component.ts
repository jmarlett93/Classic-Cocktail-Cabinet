import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { RouterLink } from '@angular/router';

import { loadCatalogBundle } from '../../core-services/catalog/catalog-bundle';
import { resolveFlavorQuery } from '../../core-services/discovery/flavor-query';
import { CabinetStore } from '../../stores/cabinet-store';

interface CatalogBottleOption {
  id: string;
  displayName: string;
}

@Component({
  selector: 'clsc-cabinet-collection',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    RouterLink,
  ],
  templateUrl: './cabinet-collection.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CabinetCollectionComponent implements OnInit {
  readonly cabinet = inject(CabinetStore);

  readonly bottles = computed<CatalogBottleOption[]>(() =>
    loadCatalogBundle()
      .bottles.map((bottle) => ({
        id: bottle.id,
        displayName: bottle.names[0] ?? bottle.id,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
  );

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

  onFocusChange(bottleId: string | null): void {
    this.cabinet.setFocus(bottleId);
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
}
