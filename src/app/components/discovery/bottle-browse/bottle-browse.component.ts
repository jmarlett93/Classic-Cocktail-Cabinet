import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { loadCatalogBundle } from '../../../core-services/catalog/catalog-bundle';
import { fuzzyMatchNames } from '../../../core-services/discovery/flavor-query';
import { BottleRecord } from '../../../models/catalog-types';
import { CabinetStore } from '../../../stores/cabinet-store';

@Component({
  selector: 'clsc-bottle-browse',
  imports: [FormsModule, RouterLink],
  templateUrl: './bottle-browse.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottleBrowseComponent {
  private readonly bundle = loadCatalogBundle();
  readonly cabinet = inject(CabinetStore);

  readonly query = signal('');

  readonly bottles = computed(() => {
    const q = this.query();
    return this.bundle.bottles
      .filter((bottle) => fuzzyMatchNames(q, bottle.names))
      .slice()
      .sort((a, b) => this.displayName(a).localeCompare(this.displayName(b)));
  });

  displayName(bottle: BottleRecord): string {
    return bottle.names[0] ?? bottle.id;
  }

  setQuery(value: string): void {
    this.query.set(value);
  }

  setFocus(bottleId: string): void {
    this.cabinet.setFocus(bottleId);
  }
}
