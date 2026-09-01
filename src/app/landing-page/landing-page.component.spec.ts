import { provideRouter, Router } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  it('offers drink-first and bottle-first paths as primary CTAs', async () => {
    await render(LandingPageComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: /Two ways in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /By the drink/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /By the bottle/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open taste chat/i })).not.toBeInTheDocument();
  });

  it('navigates flavor search to discover/flavor with q', async () => {
    const user = userEvent.setup();
    const { fixture } = await render(LandingPageComponent, {
      providers: [provideRouter([])],
    });
    const router = fixture.debugElement.injector.get(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await user.type(screen.getByLabelText(/Or start from a flavor/i), 'bitter');
    await user.click(screen.getByRole('button', { name: /Taste it/i }));

    expect(navigate).toHaveBeenCalledWith(['/discover/flavor'], {
      queryParams: { q: 'bitter' },
    });
  });
});
