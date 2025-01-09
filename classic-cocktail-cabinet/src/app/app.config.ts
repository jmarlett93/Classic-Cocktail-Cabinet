import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { UserPromptInfoStore } from './stores/user-prompt-info.store';

export const appConfig: ApplicationConfig = {
  providers: [
    UserPromptInfoStore,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
  ],
};
