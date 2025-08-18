/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
/* global console, document, Excel, Office */

// Force axios to use relative path in development so proxy can intercept
if (process.env.NODE_ENV === "development") {
  const axios = require("axios");
  axios.defaults.baseURL = "/";
  console.log("[DEV] Axios baseURL overridden to /");
}

let credentials = {
  apiKey: null as string | null,
  clientId: null as string | null,
  authToken: null as string | null,
};

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

      payload.values.forEach(([key, value], idx) => {
        const colOffset = idx;
        sheet.getRangeByIndexes(
          startCell.rowIndex,
          startCell.columnIndex + colOffset,
          1,
          1
        ).values = [[`${value}`]];
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

Office.onReady(() => {
  registerFreezeHandler();
  listenForFreezeData();
  document.getElementById("sideload-msg")!.style.display = "none";
  document.getElementById("app-body")!.style.display = "flex";

  // Manual Token Dialog button logic
  document.getElementById("open-token-dialog")?.addEventListener("click", () => {
    openTokenDialog();
  });

  // Auto-open dialog on load if credentials not stored
  if (!credentials.apiKey || !credentials.clientId || !credentials.authToken) {
    console.log("No credentials found, opening dialog...");
    openTokenDialog();
  }
});

function openTokenDialog() {
  console.log("Opening token dialog...");

  // Fixed: Use correct path without /taskpane/
  const dialogUrl = `${window.location.origin}/tokenDialog.html`;
  console.log("Dialog URL:", dialogUrl);

  Office.context.ui.displayDialogAsync(
    dialogUrl,
    { height: 50, width: 40, displayInIframe: true },
    (result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        console.error("Dialog failed to open:", result.error.message);
      } else {
        console.log("Dialog opened successfully");
        const dialog = result.value;

        dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args: any) => {
          console.log("Message received from dialog:", args);

          if (args.message) {
            try {
              const data = JSON.parse(args.message);
              if (data.type === "success") {
                // Store credentials in memory
                credentials.apiKey = data.apiKey;
                credentials.clientId = data.clientId;
                credentials.authToken = data.authToken;

                // Store token in Office Settings for custom functions to access
                // Excel.run(async (context) => {
                //   context.workbook.settings.add("authToken", data.authToken);
                //   context.workbook.settings.add("apiKey", data.apiKey);
                //   context.workbook.settings.add("clientId", data.clientId);
                //   await context.sync();
                //   console.log("Credentials stored in Office Settings");
                // });
                OfficeRuntime.storage.setItem("authToken", data.authToken);
                OfficeRuntime.storage.setItem("apiKey", data.apiKey);
                OfficeRuntime.storage.setItem("clientId", data.clientId);

                console.log("Credentials stored successfully");
                dialog.close();
              } else if (data.type === "error") {
                console.error("Error from dialog:", data.message);
              }
            } catch (e) {
              console.error("Failed to parse dialog message:", e);
            }
          }
        });

        dialog.addEventHandler(Office.EventType.DialogEventReceived, (args: any) => {
          console.log("Dialog event:", args);
        });
      }
    }
  );
}
