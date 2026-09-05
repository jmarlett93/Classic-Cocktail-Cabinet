import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DrinkBrowseComponent } from './drink-browse.component';

describe('DrinkBrowseComponent', () => {
  it('lists catalog drinks and filters by fuzzy name', async () => {
    const user = userEvent.setup();
    await render(DrinkBrowseComponent, {
      providers: [provideRouter([])],
    });

    expect(screen.getByRole('heading', { name: /Find a drink/i })).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Search drinks/i), 'negroni');
    expect(screen.getByText('Negroni')).toBeInTheDocument();
  });

  it('shows an honest empty when nothing matches', async () => {
    const user = userEvent.setup();
    await render(DrinkBrowseComponent, {
      providers: [provideRouter([])],
    });

    await user.type(screen.getByLabelText(/Search drinks/i), 'zzzz-no-such-drink');
    expect(screen.getByText(/No drinks match/i)).toBeInTheDocument();
  });
});
