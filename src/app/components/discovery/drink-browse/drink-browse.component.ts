import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { loadCatalogBundle } from '../../../core-services/catalog/catalog-bundle';
import { fuzzyMatchNames } from '../../../core-services/discovery/flavor-query';
import { DrinkRecord } from '../../../models/catalog-types';

@Component({
  selector: 'clsc-drink-browse',
  imports: [FormsModule, RouterLink],
  templateUrl: './drink-browse.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkBrowseComponent {
  private readonly bundle = loadCatalogBundle();

  readonly query = signal('');

  readonly drinks = computed(() => {
    const q = this.query();
    return this.bundle.drinks
      .filter((drink) => fuzzyMatchNames(q, drink.names))
      .slice()
      .sort((a, b) => this.displayName(a).localeCompare(this.displayName(b)));
  });

  displayName(drink: DrinkRecord): string {
    return drink.names[0] ?? drink.id;
  }

  setQuery(value: string): void {
    this.query.set(value);
  }
}
