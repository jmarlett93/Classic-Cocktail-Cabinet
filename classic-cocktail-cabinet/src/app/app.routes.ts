import { Routes } from '@angular/router';
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
];
