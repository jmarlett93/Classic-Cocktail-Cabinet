import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { FlavorProfileComponent } from './flavor-profile.component';

describe('FlavorProfileComponent', () => {
  it('renders intensity levels without relying on color alone', async () => {
    await render(FlavorProfileComponent, {
      providers: [provideRouter([])],
      componentInputs: {
        weights: { bitter: 0.9, citrus: 0.4, bright: 0.2 },
        heading: 'Flavor',
      },
    });

    expect(screen.getByText('Bitter')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.getByText(/Bitter intensity High/i)).toBeInTheDocument();
  });
});
