/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
/* global console, document, Excel, Office */


// Force axios to use relative path in development so proxy can intercept
if (process.env.NODE_ENV === 'development') {
  const axios = require('axios');
  axios.defaults.baseURL = '/';
  console.log('[DEV] Axios baseURL overridden to /');
}



// Store credentials in memory instead of localStorage
let credentials = {
  apiKey: null as string | null,
  clientId: null as string | null,
  authToken: null as string | null
};



// The initialize function must be run each time a new page is loaded
Office.onReady(() => {
  document.getElementById("sideload-msg")!.style.display = "none";
  document.getElementById("app-body")!.style.display = "flex";
  
  // Run button logic
  document.getElementById("run")!.onclick = run;
  
  // Manual Token Dialog button logic
  document.getElementById("open-token-dialog")?.addEventListener("click", () => {
    openTokenDialog();
  });

  document.getElementById("applyDropdown")?.addEventListener("click", applyDropdown);

  
  
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

export async function run() {
  try {
    await Excel.run(async (context) => {
      const range = context.workbook.getSelectedRange();
      range.load("address");
      range.format.fill.color = "yellow";
      await context.sync();
      console.log(`The range address was ${range.address}.`);
      
      // Example of using stored credentials
      if (credentials.authToken) {
        console.log("Auth token available for API calls");
        // Make your API calls here using credentials.authToken
      } else {
        console.log("No auth token available");
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function applyDropdown() {
  try {
    // 🔧 Hardcoded list of fuel types for now
    const fuelTypes = ["Electricity", "Steam", "Chilled Water"];

    // 📦 Uncomment below when ready to connect to real API
    /*
    const response = await fetch("https://your-backend.com/api/fuelTypes");
    const fuelTypes = await response.json();
    */

    await Excel.run(async (context) => {
      const sheets = context.workbook.worksheets;
      
      // Create or get hidden metadata sheet
      let metadataSheet = sheets.getItemOrNullObject("Metadata");
      await context.sync();

      if (metadataSheet.isNullObject) {
        metadataSheet = sheets.add("Metadata");
        metadataSheet.visibility = Excel.SheetVisibility.hidden;
      }

      // Write fuel types into A1:A{n}
      const range = metadataSheet.getRange(`A1:A${fuelTypes.length}`);
      range.values = fuelTypes.map((item) => [item]);
      await context.sync();

      // 🧾 Apply data validation to ActivityData!B2:B100
      const activitySheet = sheets.getActiveWorksheet();
      const inputRange = activitySheet.getRange("B2:B100");
      const rows = 99; // B2 to B100 is 99 cells

      for (let i = 0; i < rows; i++) {
        const cell = activitySheet.getRange(`B${i + 2}`);
        cell.dataValidation.rule = {
          list: {
            inCellDropDown: true,
            source: `=Metadata!A1:A${fuelTypes.length}`
          }
        };
      }


      await context.sync();
      console.log("Dropdown applied successfully.");
      const statusCell = activitySheet.getRange("D1");
      statusCell.values = [["✅ Dropdown applied successfully"]];
    });
    

  } catch (error) {
    console.error("Error applying dropdown:", error);

    // Log error inside Excel sheet
    await Excel.run(async (ctx) => {
      const sheet = ctx.workbook.worksheets.getActiveWorksheet();
      const cell = sheet.getRange("D1");
      cell.values = [[`Dropdown Error: ${error.message}`]];
      await ctx.sync();
    });
  }
}
