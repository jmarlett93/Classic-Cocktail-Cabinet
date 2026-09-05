import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { loadCatalogBundle } from '../core-services/catalog/catalog-bundle';
import { resolveFlavorQuery } from '../core-services/discovery/flavor-query';
import { CabinetStore } from '../stores/cabinet-store';

@Component({
  selector: 'app-landing-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPageComponent {
  private readonly router = inject(Router);
  private readonly cabinet = inject(CabinetStore);
  private readonly synonyms = loadCatalogBundle().synonyms;

  readonly tasteStarters = [
    { label: 'Bright & dry', text: 'bright and dry' },
    { label: 'Bitter', text: 'bitter' },
    { label: 'Herbal', text: 'herbal' },
    { label: 'Smoky', text: 'smoky' },
  ] as const;

  readonly placeholderText = signal('Try: citrus, dry, bitter, herbal...');
  readonly inputText = signal('');

  setInput(value: string): void {
    this.inputText.set(value);
  }

  private persistFlavor(raw: string): void {
    const q = raw.trim();
    if (!q) {
      return;
    }
    const terms = q
      .split(/,|\band\b/i)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    this.cabinet.setFlavorTerms(terms);
    this.cabinet.setFlavorVector(resolveFlavorQuery(q, this.synonyms));
  }

  goToFlavor(seed?: string): void {
    const q = (seed ?? this.inputText()).trim();
    this.persistFlavor(q);
    if (q.length) {
      void this.router.navigate(['/discover/flavor'], { queryParams: { q } });
    } else {
      void this.router.navigate(['/discover/flavor']);
    }
  }

  useStarter(text: string): void {
    this.inputText.set(text);
    this.goToFlavor(text);
  }
}
