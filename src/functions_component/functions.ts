/* global clearInterval, console, CustomFunctions, setInterval */





// /**
//  * Wrapper to call calculateCarbonFootprint by passing a row range (e.g., A2:G2)
//  * @customfunction
//  * @param row A row array range from the sheet, e.g., A2:G2
//  * @returns A 2D array with CO2e results
//  */
// export async function calculateCarbonFootprintRow(row: any[][]): Promise<string[][]> {
//   try {
//     const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;

//     if (flat.length < 7) {
//       return [["Error: Expected 7 columns in the input row (date, country, stateProvince, energyConsumed, unit, commodity, includeDetails)"]];
//     }

//     const [
//       date,
//       country,
//       stateProvince,
//       energyConsumed,
//       unit,
//       commodity,
//       includeDetails
//     ] = flat;

//     return await calculateCarbonFootprint(
//       String(date),
//       String(country),
//       String(stateProvince),
//       Number(energyConsumed),
//       String(unit),
//       String(commodity),
//       includeDetails === true || String(includeDetails).toLowerCase() === "true"
//     );
//   } catch (err: any) {
//     return [[
//       "Error in wrapper",
//       err?.message || JSON.stringify(err),
//       "", "", "", "", ""
//     ]];
//   }
// }



// /**
//  * Sends a POST request to the carbon API with auth headers and returns emission data.
//  * @customfunction
//  * @param date Date in YYYY-MM-DD format
//  * @param country Country name
//  * @param stateProvince State or province
//  * @param energyConsumed Amount of energy consumed
//  * @param unit Unit of energy (e.g., kwh)
//  * @param commodity Type of commodity (e.g., electricity)
//  * @param includeDetails Include detailed response
//  * @returns A 2D array with result fields or detailed error
//  */
// export async function locationHelper1(
//   date: string,
//   country: string,
//   stateProvince: string,
//   energyConsumed: number,
//   unit: string,
//   commodity: string,
//   includeDetails: boolean
// ): Promise<string[][]> {
//   let authToken: string | null = null;
//   const endpointUrl = "https://foundation-staging.agtech.ibm.com/v3/carbon/location";

//   // Format date to YYYY-MM-DD
//   try {
//     const parsedDate = new Date(date);
//     if (isNaN(parsedDate.getTime())) {
//       return [["Error: Invalid date format. Use YYYY-MM-DD"]];
//     }

//     const year = parsedDate.getFullYear();
//     const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
//     const day = String(parsedDate.getDate()).padStart(2, '0');
//     date = `${year}-${month}-${day}`;
//   } catch (e) {
//     return [["Error parsing date", String(e)]];
//   }

//   try {
//     authToken = await OfficeRuntime.storage.getItem("authToken");

//     if (!authToken || authToken.trim() === "") {
//       return [[
//         "Error: No auth token found.",
//         "Please authorize using the 'Enter API Credentials' button.",
//         "", "", "", "", "", "", ""
//       ]];
//     }

//     const headers = {
//       Authorization: `Bearer ${authToken}`,
//       "Content-Type": "application/json"
//     };

//     const payload = {
//       time: { date },
//       location: { country, stateProvince },
//       activity: { energyConsumed, unit, commodity },
//       includeDetails
//     };

//     const response = await fetch(endpointUrl, {
//       method: "POST",
//       headers,
//       body: JSON.stringify(payload)
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       return [[
//         `Error: ${response.status}`,
//         response.statusText || "Status text unavailable",
//         "Response body: " + responseText,
//         "URL: " + endpointUrl,
//         "Token (start-end): " + (authToken?.substring(0, 6) + "..." + authToken?.slice(-10)),
//         "Headers: " + JSON.stringify(headers),
//         "Payload: " + JSON.stringify(payload),
//         "Fetch: " + typeof fetch,
//         "OfficeRuntime: " + typeof OfficeRuntime?.storage
//       ]];
//     }

//     const result = JSON.parse(responseText);

//     return [[
//       result.transactionId || "",
//       result.totalCO2e?.toString() || "",
//       result.co2?.toString() || "",
//       result.ch4?.toString() || "",
//       result.n2O?.toString() || "",
//       result.indirectCo2e?.toString() || "",
//       result.unit || "",
//       result.description || "",
//       ""
//     ]];

//   } catch (error: any) {
//     return [[
//       "Catch Block Error",
//       error?.message || "Unknown error",
//       error?.stack || "No stack available",
//       "URL: " + endpointUrl,
//       "Token (last 10): " + (authToken?.slice(-10) || "N/A"),
//       "Headers: " + JSON.stringify({
//         Authorization: authToken ? `Bearer ***${authToken.slice(-10)}` : "Missing",
//         "Content-Type": "application/json"
//       }),
//       "Payload: " + JSON.stringify({
//         time: { date },
//         location: { country, stateProvince },
//         activity: { energyConsumed, unit, commodity },
//         includeDetails
//       }),
//       "Error as JSON: " + JSON.stringify(error),
//       ""
//     ]];
//   }
// }





// /**
//  * Calls the IBM Carbon Location API with stored auth token from settings.
//  * @customfunction
//  * @param date Date in YYYY-MM-DD format
//  * @param country Country name
//  * @param stateProvince State or province name
//  * @param energyConsumed Amount of energy consumed
//  * @param unit Energy unit (e.g., kwh)
//  * @param commodity Type of commodity (e.g., electricity)
//  * @param includeDetails Whether to include detailed response
//  * @returns A 2D array with emission results
//  */
// export async function locationHelper(
//   date: string,
//   country: string,
//   stateProvince: string,
//   energyConsumed: number,
//   unit: string,
//   commodity: string,
//   includeDetails: boolean
// ): Promise<string[][]> {
//   let authToken: string | null = null;

//   const payload = {
//     time: {
//       date: date,
//     },
//     location: {
//       country: country,
//       stateProvince: stateProvince,
//     },
//     activity: {
//       energyConsumed: energyConsumed,
//       commodity: commodity,
//       unit: unit,
//     },
//     includeDetails: includeDetails,
//   };

//   try {
//     // Moved declaration above, now just assign
//     authToken = await OfficeRuntime.storage.getItem("authToken");

//     if (!authToken || authToken.trim() === "") {
//       return [["Error: No auth token found. Please authorize using the 'Enter API Credentials' button in the task pane."]];
//     }

//     const response = await fetch("https://foundation-staging.agtech.ibm.com/v3/carbon/location", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       return [[
//         `Error: ${response.status}`,
//         responseText,
//         "Payload: " + JSON.stringify(payload),
//         "Token: " + authToken.substring(0, 10) + "...",
//         "", "", "", "", ""
//       ]];
//     }

//     const result = JSON.parse(responseText);

//     return [[
//       result.transactionId || "",
//       result.totalCO2e?.toString() || "",
//       result.co2?.toString() || "",
//       result.ch4?.toString() || "",
//       result.n2O?.toString() || "",
//       result.indirectCo2e?.toString() || "",
//       result.unit || "",
//       result.description || "",
//       ""
//     ]];
//   } catch (err: any) {
//   return [[
//     "locationHelper error",
//     "Message: " + (err?.message || "Unknown error"),
//     "Stack: " + (err?.stack || "No stack"),
//     "Payload: " + JSON.stringify(payload),
//     "Token: " + (authToken?.substring?.(0, 10) + "...") || "Unavailable",
//     "Fetch support: " + (typeof fetch),
//     "OfficeRuntime support: " + (typeof OfficeRuntime?.storage),
//     "", ""
//   ]];
// }

// }




// /**
//  * Wrapper to call locationHelper using a single Excel row input (e.g., A2:G2).
//  * @customfunction
//  * @param row A row with date, country, stateProvince, energyConsumed, unit, commodity, includeDetails
//  * @returns A 2D array with emission results
//  */
// export async function location(row: any[][]): Promise<string[][]> {
//   try {
//     const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;

//     if (flat.length < 7) {
//       return [["Error: Expected 7 columns in the input row (date, country, stateProvince, energyConsumed, unit, commodity, includeDetails)"]];
//     }

//     const [
//       date,
//       country,
//       stateProvince,
//       energyConsumed,
//       unit,
//       commodity,
//       includeDetails
//     ] = flat;

//     return await locationHelper1(
//       String(date),
//       String(country),
//       String(stateProvince),
//       Number(energyConsumed),
//       String(unit),
//       String(commodity),
//       includeDetails === true || String(includeDetails).toLowerCase() === "true"
//     );
//   } catch (err: any) {
//     return [[
//       "Error in wrapper",
//       err?.message || JSON.stringify(err),
//       "", "", "", "", "", "", ""
//     ]];
//   }
// }

/**
 * Calculates carbon emissions using explicit parameters and fixed values for static fields.
 * @customfunction
 * @namespace ENVIZI
 * @param date Date in YYYY-MM-DD format
 * @param country Country name
 * @param stateProvince State or province
 * @param fuelName Fuel name (e.g., Coal tar, Diesel)
 * @param fuelAmount Amount of fuel used
 * @param fuelUnit Unit of fuel (e.g., metric ton)
 * @returns A 2D array with emission result or detailed error
 */
export async function v2_stationary_helper(
  date: string,
  country: string,
  stateProvince: string,
  fuelName: string,
  fuelAmount: number,
  fuelUnit: string
): Promise<string[][]> {
  try {
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1;

    const payload = {
      customID: { id: "string" },
      onBehalfOfClient: {
        companyId: "string",
        companyName: "string",
      },
      organisation: {
        departmentId: "string",
        departmentName: "string",
      },
      requestType: "ACTUAL",
      location: {
        country: String(country),
        stateProvince: String(stateProvince),
        zipPostCode: "string",
        city: "string",
      },
      site: {
        siteId: "string",
        siteName: "string",
        buildingId: "string",
        buildingName: "string",
      },
      timePeriod: {
        year: year,
        month: month,
      },
      activityData: {
        sector: "Energy",
        fuelName: String(fuelName),
        fuelAmount: String(fuelAmount),
        fuelUnit: String(fuelUnit),
        hvBasis: "Not applicable",
      }
    };

    const authToken = await OfficeRuntime.storage.getItem("authToken");

    const response = await fetch("https://foundation-staging.agtech.ibm.com/v2/carbon/stationary", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${String(authToken)}`,
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return [[
        `Error: ${response.status}`,
        response.statusText || "",
        "Response body: " + responseText,
        "Payload: " + JSON.stringify(payload),
        "Token (last 10): " + String(authToken).slice(-10),
        "Request URL: https://foundation-staging.agtech.ibm.com/v2/carbon/stationary"
      ]];
    }

    const data = JSON.parse(responseText);

    return [[
      String(data.CO2e || ""),
      String(data.CH4 || ""),
      String(data.N2O || ""),
      String(data.fossilFuelCO2 || ""),
      String(data.biogenicCO2 || ""),
      data.unitOfMeasurement || "",
      data.description || ""
    ]];

  } catch (error: unknown) {
    let message = "Unknown error";
    let stack = "";
    if (error instanceof Error) {
      message = error.message;
      stack = error.stack || "";
    }

    return [[
      "Catch Error",
      message,
      stack,
      "Token: Not available in this scope (used OfficeRuntime)",
      "Input: " + JSON.stringify({ date, country, stateProvince, fuelName, fuelAmount, fuelUnit })
    ]];
  }
}



/**
 * Wrapper to call calculateStationaryCarbonFootprintParams using a row range.
 * Accepts a single Excel row (e.g., A2:F2) with required inputs.
 * @customfunction
 * @namespace ENVIZI
 * @param row A row with [date, country, stateProvince, fuelName, fuelAmount, fuelUnit]
 * @returns A 2D array with emission data or error details
 */
export async function v2_stationary(row: any[][]): Promise<string[][]> {
  try {
    const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;

    if (flat.length < 6) {
      return [[
        "Error: Incomplete input",
        "Expected 6 fields: date, country, stateProvince, fuelName, fuelAmount, fuelUnit"
      ]];
    }

    const [
      date,
      country,
      stateProvince,
      fuelName,
      fuelAmount,
      fuelUnit
    ] = flat;

    return await v2_stationary_helper(
      String(date),
      String(country),
      String(stateProvince),
      String(fuelName),
      Number(fuelAmount),
      String(fuelUnit)
    );
  } catch (err: unknown) {
    let message = "Unknown error";
    let stack = "";
    if (err instanceof Error) {
      message = err.message;
      stack = err.stack || "";
    }
    return [[
      "Wrapper Error",
      message,
      stack,
      JSON.stringify(row)
    ]];
  }
}


