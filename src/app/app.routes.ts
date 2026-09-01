import { Routes } from '@angular/router';
import { BottleBrowseComponent } from './components/discovery/bottle-browse/bottle-browse.component';
import { BottleDetailComponent } from './components/discovery/bottle-detail/bottle-detail.component';
import { DrinkBrowseComponent } from './components/discovery/drink-browse/drink-browse.component';
import { DrinkDetailComponent } from './components/discovery/drink-detail/drink-detail.component';
import { FlavorResultsComponent } from './components/discovery/flavor-results/flavor-results.component';
import { CabinetCollectionComponent } from './components/cabinet-collection/cabinet-collection.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'welcome',
    component: LandingPageComponent,
  },
  {
    path: 'cabinet',
    component: CabinetCollectionComponent,
  },
  {
    path: 'discover/drinks',
    component: DrinkBrowseComponent,
  },
  {
    path: 'discover/drinks/:drinkId',
    component: DrinkDetailComponent,
  },
  {
    path: 'discover/bottles',
    component: BottleBrowseComponent,
  },
  {
    path: 'discover/bottles/:bottleId',
    component: BottleDetailComponent,
  },
  {
    path: 'discover/flavor',
    component: FlavorResultsComponent,
  },

  /*
   * Legacy taste-chat route (Direction B) — intentionally disabled.
   *
   * Rationale:
   * - Product direction is two-modal discovery (drink / bottle / flavor entry), not a chatbot.
   * - The chat path pulled WebLLM + LangGraph into the app and preloaded a ~1B-param browser model,
   *   which caused severe tab freezes, crashes, and unresponsive UI on startup.
   * - Flavor needs are covered by /discover/flavor (deterministic catalog ranking, no LLM).
   * - Source kept under src/app/components/liquor-chatbot/ for reference; re-enable only if
   *   Direction B is revived with explicit performance and product sign-off.
   *
   * {
   *   path: 'liquor-recommendations',
   *   loadComponent: () =>
   *     import('./components/liquor-chatbot/liquor-chatbot.component').then((m) => m.LiquorChatbotComponent),
   * },
   */
];
