/* eslint-disable @typescript-eslint/no-explicit-any */
import { isPlatformBrowser } from "@angular/common";
import {
  ApplicationConfig,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideClientHydration, withEventReplay } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { defineCustomElements } from "@gcds-core/components/loader";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const doc = inject(DOCUMENT);
      const zone = inject(NgZone);

      if (
        isPlatformBrowser(inject(PLATFORM_ID)) &&
        doc.defaultView &&
        typeof window !== "undefined"
      ) {
        doc.querySelectorAll("style[sty-id]").forEach((el) => el.setAttribute("sty-id", ""));

        const aelFn =
          "__zone_symbol__addEventListener" in (doc.body as any)
            ? "__zone_symbol__addEventListener"
            : "addEventListener";

        return defineCustomElements(doc.defaultView, {
          syncQueue: true,
          jmp: (h: any) => zone.runOutsideAngular(h),
          ael(elm, eventName, cb, opts) {
            (elm as any)[aelFn](eventName, cb, opts);
          },
          rel(elm, eventName, cb, opts) {
            elm.removeEventListener(eventName, cb, opts);
          },
        });
      }
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
  ],
};
