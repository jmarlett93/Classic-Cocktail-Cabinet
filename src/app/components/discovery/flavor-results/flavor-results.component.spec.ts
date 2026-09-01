import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { of } from 'rxjs';

import { CabinetStore } from '../../../stores/cabinet-store';
import { FlavorResultsComponent } from './flavor-results.component';

describe('FlavorResultsComponent', () => {
  it('shows labeled drinks then bottles with likely headline', async () => {
    await render(FlavorResultsComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ q: 'bitter' })),
            snapshot: { queryParamMap: convertToParamMap({ q: 'bitter' }) },
          },
        },
      ],
    });

    expect(screen.getByRole('heading', { name: /^Drinks$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Bottles$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Likely/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /bitter/i })).toBeInTheDocument();
  });

  it('does not invent entities for unknown flavor', async () => {
    await render(FlavorResultsComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: of(convertToParamMap({ q: 'xyzzy-unknown-flavor' })),
            snapshot: { queryParamMap: convertToParamMap({ q: 'xyzzy-unknown-flavor' }) },
          },
        },
      ],
    });

    expect(screen.getByText(/don’t recognize/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^Drinks$/i })).not.toBeInTheDocument();
  });
});
