import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { of } from 'rxjs';

import { CabinetStore } from '../../../stores/cabinet-store';
import { BottleDetailComponent } from './bottle-detail.component';

describe('BottleDetailComponent', () => {
  async function setup() {
    const view = await render(BottleDetailComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ bottleId: 'bottle-campari' })),
            snapshot: { paramMap: convertToParamMap({ bottleId: 'bottle-campari' }) },
          },
        },
      ],
    });
    const cabinet = view.fixture.debugElement.injector.get(CabinetStore);
    cabinet.resetSession();
    return { view, cabinet };
  }

  it('shows Campari and sets focus for owned ∪ focus', async () => {
    const { cabinet } = await setup();
    expect(screen.getByRole('heading', { name: /Campari/i })).toBeInTheDocument();
    expect(cabinet.focusBottleId()).toBe('bottle-campari');
    expect(cabinet.effectiveHaveSet()).toContain('bottle-campari');
  });

  it('shows unlock labeled separately from flavor neighbors', async () => {
    await setup();
    expect(screen.getByRole('heading', { name: /What to buy next/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Nearby bottles \(flavor\)/i })).toBeInTheDocument();
    expect(screen.getByText(/unlock/i)).toBeInTheDocument();
  });

  it('lists complete and one-away drink sections', async () => {
    await setup();
    expect(screen.getByRole('heading', { name: /Drinks you can make/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /One bottle away/i })).toBeInTheDocument();
  });
});
