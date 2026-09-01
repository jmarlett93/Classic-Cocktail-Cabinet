import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FlavorWeights } from '../../../models/catalog-types';
import { FLAVOR_DIMENSIONS_V1 } from '../../../models/flavor-dimensions';
import { flavorIntensityLevel } from '../../../core-services/discovery/flavor-query';

export interface FlavorChipView {
  id: string;
  label: string;
  level: 'Low' | 'Medium' | 'High';
  weight: number;
  flavorClass: string;
}

@Component({
  selector: 'clsc-flavor-profile',
  imports: [DecimalPipe],
  templateUrl: './flavor-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlavorProfileComponent {
  private static readonly CHIP_TINT: Record<string, string> = {
    balance: 'bg-flavor-balance border-flavor-balance-edge',
    aromatic: 'bg-flavor-aromatic border-flavor-aromatic-edge',
    impression: 'bg-flavor-impression border-flavor-impression-edge',
    texture: 'bg-flavor-texture border-flavor-texture-edge',
  };
  /** Sparse flavor weights to display. */
  readonly weights = input.required<FlavorWeights>();
  /** Optional heading for the profile region. */
  readonly heading = input('Flavor');
  /** When true, show numeric weight alongside Low/Med/High. */
  readonly showWeight = input(false);

  readonly chips = computed<FlavorChipView[]>(() => {
    const map = this.weights();
    return FLAVOR_DIMENSIONS_V1.filter((dim) => {
      const w = map[dim.id];
      return typeof w === 'number' && w > 0;
    })
      .map((dim) => {
        const weight = map[dim.id] ?? 0;
        return {
          id: dim.id,
          label: dim.label,
          level: flavorIntensityLevel(weight),
          weight,
          flavorClass: dim.flavorClass,
        };
      })
      .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));
  });

  chipTintClass(flavorClass: string): string {
    return FlavorProfileComponent.CHIP_TINT[flavorClass] ?? 'bg-surface-raised border-border';
  }
}
