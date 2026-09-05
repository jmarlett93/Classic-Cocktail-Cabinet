import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { loadCatalogBundle } from '../../../core-services/catalog/catalog-bundle';
import { resolveFlavorQuery } from '../../../core-services/discovery/flavor-query';
import { rankPossibleLikelyByFlavorVector } from '../../../core-services/discovery/possible-likely-ranking';
import { CabinetStore } from '../../../stores/cabinet-store';
import { FlavorProfileComponent } from '../flavor-profile/flavor-profile.component';

@Component({
  selector: 'clsc-flavor-results',
  imports: [RouterLink, FlavorProfileComponent],
  templateUrl: './flavor-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlavorResultsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly cabinet = inject(CabinetStore);
  private readonly bundle = loadCatalogBundle();

  private readonly queryParam = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('q') ?? '')),
    { initialValue: '' },
  );

  readonly showPossibleDrinks = signal(false);
  readonly showPossibleBottles = signal(false);

  readonly queryText = computed(() => this.queryParam().trim());

  readonly queryVector = computed(() => {
    const q = this.queryText();
    if (!q) {
      return undefined;
    }
    return resolveFlavorQuery(q, this.bundle.synonyms);
  });

  readonly results = computed(() => {
    const vector = this.queryVector();
    if (!vector || Object.keys(vector).length === 0) {
      return null;
    }
    return rankPossibleLikelyByFlavorVector(this.bundle, vector);
  });

  constructor() {
    effect(() => {
      const q = this.queryParam();
      if (q.trim()) {
        this.persistQuery(q);
      }
    });
  }

  persistQuery(raw: string): void {
    const terms = raw
      .split(/,|\band\b/i)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    this.cabinet.setFlavorTerms(terms);
    const vector = resolveFlavorQuery(raw, this.bundle.synonyms);
    this.cabinet.setFlavorVector(vector);
  }

  togglePossibleDrinks(): void {
    this.showPossibleDrinks.update((v) => !v);
  }

  togglePossibleBottles(): void {
    this.showPossibleBottles.update((v) => !v);
  }
}
