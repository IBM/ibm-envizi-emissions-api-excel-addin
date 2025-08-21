/*
 * Copyright IBM Corp. 2025
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import {
  fluentButton,
  fluentCheckbox,
  fluentTextField,
  provideFluentDesignSystem,
} from "@fluentui/web-components";

import {
  ApiCredentials,
  loadApiCredentialsFromStorage,
  removeApiCredentialsFromStorage,
  saveApiCredentialsToStorage,
  setApiCredentials,
} from "../common/credentials";
import { ensureClient } from "../functions/client";

/* global console, document, Excel, Office */

provideFluentDesignSystem().register(fluentButton(), fluentCheckbox(), fluentTextField());

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";

  const credentialsForm = document.forms["credentials"];
  credentialsForm.onsubmit = (event: Event) => {
    event.preventDefault();
    login();
  };

  loadApiCredentialsFromStorage().then((apiCredentials) => {
    if (apiCredentials) {
      credentialsForm["apiKey"].value = apiCredentials.apiKey;
      credentialsForm["tenantId"].value = apiCredentials.tenantId;
      credentialsForm["orgId"].value = apiCredentials.orgId;
    }
  });
});

export function login(): void {
  const form = document.forms["credentials"];
  const apiCredentials: ApiCredentials = {
    apiKey: form["apiKey"].value,
    tenantId: form["tenantId"].value,
    orgId: form["orgId"].value,
  };

  ensureClient(apiCredentials)
    .then(() => {
      if (form["saveCredentials"].value) {
        saveApiCredentialsToStorage(apiCredentials);
      } else {
        setApiCredentials(apiCredentials);
        removeApiCredentialsFromStorage();
      }
    })
    .catch((e) => {
      // TODO:
    });
}
