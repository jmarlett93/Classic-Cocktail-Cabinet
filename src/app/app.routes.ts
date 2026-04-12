import { Routes } from '@angular/router';
import { LiquorChatbotComponent } from './components/liquor-chatbot/liquor-chatbot.component';
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
  { path: 'liquor-recommendations', component: LiquorChatbotComponent },
];
