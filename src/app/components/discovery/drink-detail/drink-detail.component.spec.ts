import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

import { CabinetStore } from '../../../stores/cabinet-store';
import { DrinkDetailComponent } from './drink-detail.component';

describe('DrinkDetailComponent', () => {
  async function setup() {
    const view = await render(DrinkDetailComponent, {
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ drinkId: 'drink-negroni' })),
            snapshot: { paramMap: convertToParamMap({ drinkId: 'drink-negroni' }) },
          },
        },
      ],
    });
    view.fixture.debugElement.injector.get(CabinetStore).resetSession();
    return view;
  }

  it('shows Negroni with composed flavor and required bottles', async () => {
    await setup();
    expect(screen.getByRole('heading', { name: /Negroni/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bottles you need/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /How it tastes/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Campari/i })).toBeInTheDocument();
  });

  it('can reveal from-bottles vs prep split', async () => {
    const user = userEvent.setup();
    await setup();
    await user.click(screen.getByRole('button', { name: /Show what comes from bottles/i }));
    expect(screen.getByRole('heading', { name: /From bottles/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /From prep and garnish/i })).toBeInTheDocument();
  });
});
