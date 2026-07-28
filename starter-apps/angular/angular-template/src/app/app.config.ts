import {
  ApplicationConfig,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { defineCustomElements } from "@gcds-core/components/loader";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => defineCustomElements()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
  ],
};
