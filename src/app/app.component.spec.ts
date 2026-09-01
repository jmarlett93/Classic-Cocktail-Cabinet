import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('promotes two-mode discovery nav and not taste chat', async () => {
    await render(AppComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: /Classic Cocktail Cabinet/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Drinks/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Bottles/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Cabinet/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Taste chat/i })).not.toBeInTheDocument();
  });
});
