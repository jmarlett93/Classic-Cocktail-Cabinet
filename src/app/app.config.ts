import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TasteNarrationFacade } from './core-services/taste-narration.facade';
import { CabinetStore } from './stores/cabinet-store';
import { UserPromptInfoStore } from './stores/user-prompt-info.store';

export const appConfig: ApplicationConfig = {
  providers: [
    UserPromptInfoStore,
    CabinetStore,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideAppInitializer(() => {
      inject(TasteNarrationFacade).preloadBrowserLlm();
    }),
  ],
};
