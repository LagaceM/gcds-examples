import {
  APP_ID,
  ApplicationConfig,
  DOCUMENT,
  inject,
  mergeApplicationConfig,
  provideAppInitializer,
} from "@angular/core";
import { BEFORE_APP_SERIALIZED } from "@angular/platform-server";
import { provideServerRendering, withRoutes } from "@angular/ssr";
import { hydrateDocument } from "@gcds-core/components/hydrate";
import { defineCustomElements } from "@gcds-core/components/loader";
import { appConfig } from "./app.config";
import { serverRoutes } from "./app.routes.server";

const serverConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => defineCustomElements()),
    {
      provide: BEFORE_APP_SERIALIZED,
      useFactory: () => {
        const doc = inject(DOCUMENT);
        const appId = inject(APP_ID);

        return () => hydrateGcdsComponents(doc, appId);
      },
      multi: true,
    },
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);

export function hydrateGcdsComponents(doc: Document, appId: string) {
  console.debug("hydrateGcdsComponents", doc, appId);

  return hydrateDocument(doc, {
    serializeShadowRoot: "scoped",
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
