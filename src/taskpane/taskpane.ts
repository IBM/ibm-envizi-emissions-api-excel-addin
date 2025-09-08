/*
 * Copyright IBM Corp. 2025
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

import {
  fluentAccordion,
  fluentAccordionItem,
  fluentAnchor,
  fluentButton,
  fluentCheckbox,
  fluentTab,
  fluentTabPanel,
  fluentTabs,
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
import { getEnvType } from "../common/env";
import { ensureClient, resetClient } from "../functions/client";

/* global console, document, Excel, Office */

const apiHomeUrls = {
  prod: "https://www.app.ibm.com/envizi/emissions-api-home",
  np: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
  local: "https://www-dev.app.ibm.com/envizi/emissions-api-home",
};

let getStartedClicked = false;
let pageElements: HTMLElement[];

provideFluentDesignSystem().register(
  fluentAccordion(),
  fluentAccordionItem(),
  fluentAnchor(),
  fluentButton(),
  fluentCheckbox(),
  fluentTab(),
  fluentTabPanel(),
  fluentTabs(),
  fluentTextField()
);

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "block";

  pageElements = Array.from(document.getElementsByClassName("page")) as HTMLElement[];
  getStartedClicked = window.localStorage.getItem("getStartedClicked") === "true";

  initGetStartedPage();
  initLoginPage();
  initMainPage();

  loadApiCredentialsFromStorage().then((apiCredentials) => {
    if (apiCredentials) {
      const credentialsForm = document.forms["credentials"];
      credentialsForm["apiKey"].value = apiCredentials.apiKey;
      credentialsForm["tenantId"].value = apiCredentials.tenantId;
      credentialsForm["orgId"].value = apiCredentials.orgId;
    }

    let pageId = "welcome-page";
    if (apiCredentials) {
      pageId = "main-page";
    } else if (getStartedClicked) {
      pageId = "login-page";
    }
    switchPage(pageId);
  });
});

function getOverviewDashboardUrl(): string {
  return `${apiHomeUrls[getEnvType()]}/overview`;
}

function initGetStartedPage(): void {
  document.getElementById("get-started-button").onclick = () => {
    getStartedClicked = true;
    window.localStorage.setItem("getStartedClicked", "true");
    switchPage("login-page");
  };
}

function initLoginPage(): void {
  (document.getElementById("overview-dashboard-link") as any).href = getOverviewDashboardUrl();
  const loginForm = document.forms["login"];
  loginForm.onsubmit = (event: Event) => {
    event.preventDefault();
    login();
  };
}

function initMainPage(): void {
  document.getElementById("view-dashboard-button").onclick = () => {
    window.open(getOverviewDashboardUrl(), "_blank", "noopener");
  };
  document.getElementById("logout-button").onclick = logout;
}

function switchPage(id: string): void {
  pageElements.forEach((pageElement) => {
    pageElement.hidden = pageElement.id !== id;
  });
}

export function login(): void {
  const loginForm = document.forms["login"];
  const apiCredentials: ApiCredentials = {
    apiKey: loginForm["apiKey"].value,
    tenantId: loginForm["tenantId"].value,
    orgId: loginForm["orgId"].value,
  };

  ensureClient(apiCredentials)
    .then(() => {
      if (loginForm["saveCredentials"].value) {
        saveApiCredentialsToStorage(apiCredentials);
      } else {
        setApiCredentials(apiCredentials);
        removeApiCredentialsFromStorage();
      }
      const credentialsForm = document.forms["credentials"];
      credentialsForm["apiKey"].value = apiCredentials.apiKey;
      credentialsForm["tenantId"].value = apiCredentials.tenantId;
      credentialsForm["orgId"].value = apiCredentials.orgId;
      switchPage("main-page");
    })
    .catch((e) => {
      // TODO:
    });
}

export function logout(): void {
  setApiCredentials(null);
  removeApiCredentialsFromStorage();
  resetClient();

  const loginForm = document.forms["login"];
  loginForm["apiKey"].value = "";
  loginForm["tenantId"].value = "";
  loginForm["orgId"].value = "";
  switchPage("login-page");
}
