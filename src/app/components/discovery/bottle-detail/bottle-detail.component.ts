import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { loadCatalogBundle } from '../../../core-services/catalog/catalog-bundle';
import { computeDrinkCompleteness } from '../../../core-services/discovery/drink-completeness';
import {
  rankPossibleLikelyByBottleId,
  ReasonedEntity,
} from '../../../core-services/discovery/possible-likely-ranking';
import {
  rankWeightedUnlockCandidatesV1,
  unlockDrinkNames,
} from '../../../core-services/discovery/weighted-unlock';
import { CabinetStore } from '../../../stores/cabinet-store';
import { FlavorProfileComponent } from '../flavor-profile/flavor-profile.component';

interface DrinkListItem {
  id: string;
  name: string;
  missingBottleIds: string[];
  missingNames: string[];
  reasons?: string[];
}

@Component({
  selector: 'clsc-bottle-detail',
  imports: [RouterLink, MatButtonModule, FlavorProfileComponent, DecimalPipe],
  templateUrl: './bottle-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  readonly cabinet = inject(CabinetStore);
  private readonly bundle = loadCatalogBundle();

  private readonly bottleId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('bottleId') ?? '')),
    { initialValue: '' },
  );

  readonly showPossibleNeighbors = signal(false);

  constructor() {
    effect(() => {
      const id = this.bottleId();
      if (id) {
        this.cabinet.setFocus(id);
      }
    });
  }

  readonly bottle = computed(() =>
    this.bundle.bottles.find((b) => b.id === this.bottleId()),
  );

  readonly displayName = computed(() => this.bottle()?.names[0] ?? 'Bottle not found');

  readonly completeness = computed(() => {
    const focus = this.bottleId();
    if (!focus) {
      return { complete: [] as DrinkListItem[], oneAway: [] as DrinkListItem[] };
    }

    const results = computeDrinkCompleteness(this.bundle, {
      ownedBottleIds: this.cabinet.ownedBottleIds(),
      focusBottleId: focus,
    });

    const nameOf = (id: string) =>
      this.bundle.drinks.find((d) => d.id === id)?.names[0] ?? id;
    const bottleName = (id: string) =>
      this.bundle.bottles.find((b) => b.id === id)?.names[0] ?? id;

    const involvingFocus = results.filter((row) => {
      const drink = this.bundle.drinks.find((d) => d.id === row.drinkId);
      return drink?.ingredients.some(
        (ing) => ing.componentKind === 'bottle' && ing.componentId === focus,
      );
    });

    const complete = involvingFocus
      .filter((row) => row.class === 'complete')
      .map((row) => ({
        id: row.drinkId,
        name: nameOf(row.drinkId),
        missingBottleIds: [],
        missingNames: [],
      }));

    const oneAway = involvingFocus
      .filter((row) => row.class === 'oneBottleAway')
      .map((row) => ({
        id: row.drinkId,
        name: nameOf(row.drinkId),
        missingBottleIds: row.missingBottleIds,
        missingNames: row.missingBottleIds.map(bottleName),
      }));

    return { complete, oneAway };
  });

  readonly unlockCandidates = computed(() => {
    const focus = this.bottleId();
    if (!focus) {
      return [];
    }
    return rankWeightedUnlockCandidatesV1(this.bundle, {
      ownedBottleIds: this.cabinet.ownedBottleIds(),
      focusBottleId: focus,
      userFlavorVector: this.cabinet.flavorVector?.(),
      limit: 5,
    }).map((candidate) => ({
      ...candidate,
      name:
        this.bundle.bottles.find((b) => b.id === candidate.bottleId)?.names[0] ??
        candidate.bottleId,
      unlockedNames: unlockDrinkNames(this.bundle, candidate.unlockedDrinkIds),
    }));
  });

  readonly neighbors = computed(() => {
    const focus = this.bottleId();
    if (!focus) {
      return { likely: [] as ReasonedEntity[], possible: [] as ReasonedEntity[] };
    }
    const ranked = rankPossibleLikelyByBottleId(this.bundle, focus);
    return {
      likely: ranked.likelyBottles.filter((b) => b.id !== focus),
      possible: ranked.possibleBottles.filter((b) => b.id !== focus),
    };
  });

  readonly likelyDrinks = computed(() => {
    const focus = this.bottleId();
    if (!focus) {
      return [] as ReasonedEntity[];
    }
    return rankPossibleLikelyByBottleId(this.bundle, focus).likelyDrinks;
  });

  toggleOwned(): void {
    const id = this.bottleId();
    if (id) {
      this.cabinet.toggleOwned(id);
    }
  }

  togglePossibleNeighbors(): void {
    this.showPossibleNeighbors.update((v) => !v);
  }
}
