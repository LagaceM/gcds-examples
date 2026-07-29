import { APP_ID, ApplicationConfig, DOCUMENT, inject, mergeApplicationConfig } from "@angular/core";
import { BEFORE_APP_SERIALIZED } from "@angular/platform-server";
import { provideServerRendering, withRoutes } from "@angular/ssr";
import { hydrateDocument } from "@gcds-core/components/hydrate";
import { appConfig } from "./app.config";
import { serverRoutes } from "./app.routes.server";

const serverConfig: ApplicationConfig = {
  providers: [
    {
      provide: BEFORE_APP_SERIALIZED,
      useFactory: hydrateIonicComponents,
      multi: true,
      deps: [DOCUMENT, APP_ID],
    },
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

export function hydrateGcdsComponents(doc: Document, appId: string) {
  return hydrateDocument(doc, {
    serializeShadowRoot: "scoped",
    clientHydrateAnnotations: true,
  }).then((hydrateResults) => {
    hydrateResults.diagnostics.forEach((d) => {
      if (d.type === "error") {
        console.error(d.messageText);
      } else if (d.type === "debug") {
        console.debug(d.messageText);
      } else {
        console.log(d.messageText);
      }
    });
    return hydrateResults;
  });
}

export function hydrateIonicComponents() {
  const doc = inject(DOCUMENT);
  const appId = inject(APP_ID);

  return () => {
    const supportsNativeAttachShadow =
      typeof doc?.createElement?.('div')?.attachShadow === 'function';

    return hydrateDocument(doc, {
      // Fallback for SSR DOMs (e.g. Domino) that do not implement attachShadow.
      ...(supportsNativeAttachShadow
        ? { clientHydrateAnnotations: false }
        : {
            serializeShadowRoot: 'scoped',
            clientHydrateAnnotations: true,
          }),
      excludeComponents: [
        // overlays
        'ion-action-sheet',
        'ion-alert',
        'ion-loading',
        'ion-modal',
        'ion-picker-legacy',
        'ion-popover',
        'ion-toast',
        'ion-toast',

        // navigation
        'ion-router',
        'ion-route',
        'ion-route-redirect',
        'ion-router-link',
        'ion-router-outlet',

        // tabs
        'ion-tabs',
        'ion-tab',

        // auxiliar
        'ion-picker-legacy-column',
      ],
    }).then((hydrateResults) => {
      hydrateResults.diagnostics.forEach((d) => {
        if (d.type === 'error') {
          console.error(d.messageText);
        } else if (d.type === 'debug') {
          console.debug(d.messageText);
        } else {
          console.log(d.messageText);
        }
      });

      if (doc.head != null) {
        const styleElms = doc.head.querySelectorAll('style[data-styles]') as NodeListOf<HTMLStyleElement>;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < styleElms.length; i++) {
          styleElms[i].setAttribute('ng-transition', appId);
        }
      }

      if (doc.body != null) {
        const ionPages = doc.body.querySelectorAll('.ion-page.ion-page-invisible') as NodeListOf<HTMLElement>;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < ionPages.length; i++) {
          ionPages[i].classList.remove('ion-page-invisible');
        }
      }
    });
  };
}
