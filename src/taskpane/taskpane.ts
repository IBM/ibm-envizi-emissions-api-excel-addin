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

function registerFreezeHandler() {
  console.log("[FreezeHandler] Registering freezeHandler...");

  (window as any).freezeHandler = async (payload: { address: string; values: [string, any][] }) => {
    console.log("[FreezeHandler] Called with payload:", JSON.stringify(payload));

    await Excel.run(async (context) => {
      const regex = /^(.*?)!(.*)$/;
      const match = regex.exec(payload.address);
      const sheetName = match ? match[1].replace(/'/g, "") : "";
      const cellAddress = match ? match[2] : payload.address;

      console.log(
        `[FreezeHandler] Parsed sheetName: "${sheetName}", cellAddress: "${cellAddress}"`
      );

      const sheet = context.workbook.worksheets.getItem(sheetName);
      const startCell = sheet.getRange(cellAddress);

      startCell.load(["rowIndex", "columnIndex"]);
      await context.sync();

      const rowValues = payload.values[0]; // first row of your [[...]] shape

rowValues.forEach((value, idx) => {
  sheet.getRangeByIndexes(
    startCell.rowIndex,
    startCell.columnIndex + idx,
    1,
    1
  ).values = [[value]];
});

      console.log("[FreezeHandler] Writing complete. Auto-fitting...");

      const fullRange = sheet.getRangeByIndexes(
        startCell.rowIndex,
        startCell.columnIndex,
        1,
        payload.values.length
      );
      fullRange.format.autofitColumns();
      fullRange.format.autofitRows();

      await context.sync();
      console.log("[FreezeHandler] Key-value pairs written successfully!");
    }).catch((err) => {
      console.error("[FreezeHandler] Error occurred:", err);
    });
  };

  console.log("[FreezeHandler] freezeHandler registered successfully.");
}

async function listenForFreezeData() {
  setInterval(async () => {
    try {
      const allKeys = await OfficeRuntime.storage.getKeys();

      const freezeKeys = allKeys.filter((key) => key.startsWith("freezeData-"));

      for (const key of freezeKeys) {
        const stored = await OfficeRuntime.storage.getItem(key);
        if (stored) {
          try {
            const payload = JSON.parse(stored);
            console.log("[FreezeHandler] Detected freezeData:", payload);
            await (window as any).freezeHandler(payload);
            await OfficeRuntime.storage.removeItem(key);
          } catch (err) {
            console.error(`[FreezeHandler] Failed to parse freezeData for key: ${key}`, err);
          }
        }
      }
    } catch (err) {
      console.error("[FreezeHandler] Error checking freezeData keys:", err);
    }
  }, 1000);
}

// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  registerFreezeHandler();
  listenForFreezeData();
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
