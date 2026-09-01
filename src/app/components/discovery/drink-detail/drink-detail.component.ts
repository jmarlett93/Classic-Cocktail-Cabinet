import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { loadCatalogBundle } from '../../../core-services/catalog/catalog-bundle';
import { composeDrinkFlavorV1 } from '../../../core-services/discovery/compose-drink-flavor';
import { rankPossibleLikelyByFlavorVector } from '../../../core-services/discovery/possible-likely-ranking';
import { CabinetStore } from '../../../stores/cabinet-store';
import { FlavorProfileComponent } from '../flavor-profile/flavor-profile.component';

@Component({
  selector: 'clsc-drink-detail',
  imports: [RouterLink, MatButtonModule, FlavorProfileComponent],
  templateUrl: './drink-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DrinkDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly cabinet = inject(CabinetStore);
  private readonly bundle = loadCatalogBundle();

  private readonly drinkId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('drinkId') ?? '')),
    { initialValue: '' },
  );

  readonly showSplit = signal(false);

  readonly drink = computed(() =>
    this.bundle.drinks.find((d) => d.id === this.drinkId()),
  );

  readonly displayName = computed(() => {
    const drink = this.drink();
    return drink?.names[0] ?? 'Drink not found';
  });

  readonly composedViews = computed(() => {
    const drink = this.drink();
    if (!drink) {
      return null;
    }
    return composeDrinkFlavorV1(drink, this.bundle);
  });

  readonly bottleRows = computed(() => {
    const drink = this.drink();
    if (!drink) {
      return [];
    }
    return drink.ingredients
      .filter((row) => row.componentKind === 'bottle')
      .map((row) => {
        const bottle = this.bundle.bottles.find((b) => b.id === row.componentId);
        return {
          id: row.componentId,
          name: bottle?.names[0] ?? row.componentId,
          role: row.role,
          amountMl: row.amountMl,
          flavor: bottle?.flavor ?? {},
          owned: this.cabinet.isOwned(row.componentId),
        };
      });
  });

  readonly stapleRows = computed(() => {
    const drink = this.drink();
    if (!drink) {
      return [];
    }
    return drink.ingredients
      .filter((row) => row.componentKind === 'staple')
      .map((row) => {
        const staple = this.bundle.staples.find((s) => s.id === row.componentId);
        return {
          id: row.componentId,
          name: staple?.names[0] ?? row.componentId,
          role: row.role,
          amountMl: row.amountMl,
        };
      });
  });

  readonly nearbyDrinks = computed(() => {
    const views = this.composedViews();
    const drink = this.drink();
    if (!views || !drink) {
      return [];
    }
    const ranked = rankPossibleLikelyByFlavorVector(this.bundle, views.composed);
    return ranked.likelyDrinks.filter((d) => d.id !== drink.id).slice(0, 5);
  });

  readonly missingBottles = computed(() => {
    const have = new Set(this.cabinet.effectiveHaveSet());
    return this.bottleRows().filter((row) => !have.has(row.id));
  });

  toggleSplit(): void {
    this.showSplit.update((v) => !v);
  }

  toggleOwned(bottleId: string): void {
    this.cabinet.toggleOwned(bottleId);
  }

  focusBottle(bottleId: string): void {
    this.cabinet.setFocus(bottleId);
  }
}
