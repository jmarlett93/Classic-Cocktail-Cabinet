import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { CabinetCollectionComponent } from './cabinet-collection.component';
import { CabinetStore } from '../../stores/cabinet-store';

describe('CabinetCollectionComponent', () => {
  it('renders catalog bottles for the session cabinet', async () => {
    const { fixture } = await render(CabinetCollectionComponent, {
      providers: [provideRouter([])],
    });
    fixture.debugElement.injector.get(CabinetStore).resetSession();

    expect(screen.getByRole('heading', { name: /What bottles do you have on hand/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Catalog bottles/i })).toBeInTheDocument();
    expect(fixture.componentInstance.bottles().length).toBeGreaterThan(0);
    expect(fixture.componentInstance.bottles().every((b) => b.id.startsWith('bottle-'))).toBe(true);
  });
});
