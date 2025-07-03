/* global clearInterval, console, CustomFunctions, setInterval */

import { Client, LocationApi } from 'ibm-ghg-sdk';


// Check if Excel passed the date as a number (Excel serial date) and convert to YYYY-MM-DD
function convertExcelDateToISO(date: string | number): string {
  if (typeof date === "number") {
    const jsDate = new Date(Math.round((date - 25569) * 86400 * 1000)); // Excel serial to JS date
    return jsDate.toISOString().split("T")[0]; // Return YYYY-MM-DD
  } else if (!isNaN(Number(date))) {
    // Handle case where Excel passed a number as string (e.g., "45567")
    const jsDate = new Date(Math.round((Number(date) - 25569) * 86400 * 1000));
    return jsDate.toISOString().split("T")[0];
  } else {
    return String(date); // Assume already in YYYY-MM-DD
  }
}

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
 * @param energyConsumed Amount of energy used (e.g., 1000)
 * @param commodity Type of commodity (e.g., "electricity")
 * @param unit Unit of energy (e.g., "kwh")
 * @param includeDetails true or false
 * @returns A 2D array with emission result or detailed error
 */
export async function v3_location_helper(
  date: string,
  country: string,
  stateProvince: string,
  energyConsumed: number,
  commodity: string,
  unit: string,
  includeDetails: boolean,
): Promise<string[][]> {
  const logs: string[][] = []; // To store messages for each step
  let updateResponse: unknown = null;

  try {
    const formattedDate = convertExcelDateToISO(date);
    logs.push(["Step 1", "Date formatted", formattedDate]);

    const apiKey = await OfficeRuntime.storage.getItem("apiKey");
    const clientId = await OfficeRuntime.storage.getItem("clientId");

    logs.push(["Step 2", "API keys fetched", `apiKey: ${apiKey?.slice(0, 4)}..., clientId: ${clientId?.slice(0, 4)}...`]);

    const initMessage = await Client.init({ apiKey, clientId });
    logs.push(["Step 3", "Client.init() result", initMessage]);

    if (!initMessage.toLowerCase().includes("success")) {
      logs.push(["Step 3 Failed", "Client initialization failed", initMessage]);
      return logs;
    }

    // Call API
    try {
      updateResponse = await LocationApi.calculate({
        location: {
          country: String(country),
          stateProvince: String(stateProvince),
        },
        time: {
          date: formattedDate,
        },
        activity: {
          energyConsumed: Number(energyConsumed),
          commodity: String(commodity),
          unit: String(unit),
        },
        includeDetails: Boolean(includeDetails),
      });

      logs.push(["Step 4", "API call succeeded", JSON.stringify(updateResponse)]);
    } catch (apiError: unknown) {
      const message = apiError instanceof Error ? apiError.message : "Unknown API error";
      const stack = apiError instanceof Error && apiError.stack ? apiError.stack : "";
      logs.push(["Step 4 Failed", message, stack]);
      logs.push(["Raw API Response", JSON.stringify(updateResponse)]);
      return logs;
    }

    // Parse response
    try {
      const response = JSON.parse(updateResponse as string) as {
        transactionId: string;
        totalCO2e: number;
        co2: number;
        ch4: number;
        n2O: number;
        unit: string;
        description: string;
      };

      logs.push(["Step 5", "Parsed API response", "Success"]);
      logs.push(["Final Output", "transactionId", response.transactionId]);
      logs.push(["", "totalCO2e", response.totalCO2e.toString()]);
      logs.push(["", "co2", response.co2.toString()]);
      logs.push(["", "ch4", response.ch4.toString()]);
      logs.push(["", "n2O", response.n2O.toString()]);
      logs.push(["", "unit", response.unit]);
      logs.push(["", "description", response.description]);

      return logs;
    } catch (parseErr: any) {
      logs.push(["Step 5 Failed", "Failed to parse response", parseErr?.message || "Unknown error"]);
      return logs;
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown general error";
    const stack = error instanceof Error && error.stack ? error.stack : "";
    logs.push(["General Error", message, stack]);
    return logs;
  }
}

// export async function direct_fetch_location(
//   date: string,
//   country: string,
//   stateProvince: string,
//   energyConsumed: number,
//   commodity: string,
//   unit: string,
//   includeDetails: boolean,
// ): Promise<string[][]> {
//   const logs: string[][] = [];

//   try {
//     const formattedDate = date;
//     logs.push(["Step 1 - Date formatted", formattedDate]);

//     const apiKey = await OfficeRuntime.storage.getItem("apiKey");
//     const clientId = await OfficeRuntime.storage.getItem("clientId");
//     logs.push(["Step 2 - API keys fetched", `apiKey: ${apiKey || "MISSING"}`, `clientId: ${clientId || "MISSING"}`]);

//     if (!apiKey || !clientId) {
//       logs.push(["Step 2F - Missing credentials"]);
//       return logs;
//     }

//     logs.push(["Step 3 - Fetching token..."]);
//     const tokenResponse = await fetch("https://stg.auth-b2b-twc.ibm.com/Auth/GetBearerForClient", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ apiKey, clientId }),
//     });

//     const tokenJson = await tokenResponse.json();
//     const token = tokenJson.access_token;

//     if (!token) {
//       logs.push(["Step 3F - Token fetch failed", JSON.stringify(tokenJson)]);
//       return logs;
//     }

//     logs.push(["Step 3 - Token fetched successfully", `Token: ${token.substring(0, 10)}...`]);

//     const payload = {
//       time: { date: formattedDate },
//       location: { country, stateProvince },
//       activity: { energyConsumed, commodity, unit },
//       includeDetails,
//     };
//     logs.push(["Step 4 - Payload prepared", JSON.stringify(payload)]);

//     const locationResponse = await fetch("https://foundation-staging.agtech.ibm.com/v3/carbon/location", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//         accept: "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const responseJson = await locationResponse.json();

//     if (!locationResponse.ok) {
//       logs.push([
//         "Step 5F - API call failed",
//         `Status: ${locationResponse.status}`,
//         JSON.stringify(responseJson),
//       ]);
//       return logs;
//     }

//     logs.push(["Step 5 - API call success"]);

//     logs.push([
//       "Step 6 - Final Result",
//       `TxnID: ${responseJson.transactionId || "N/A"}`,
//       `CO2e: ${responseJson.totalCO2e?.toString() || "N/A"}`,
//       `Unit: ${responseJson.unit || "N/A"}`,
//       `Desc: ${responseJson.description || "N/A"}`,
//     ]);

//     return logs;

//   } catch (error: any) {
//     logs.push(["Step X - General catch", error?.message || "Unknown error"]);
//     return logs.length > 0 ? logs : [["Step X - Uncaught error", "No logs available"]];
//   }
// }




/**
 * Wrapper to call calculateStationaryCarbonFootprintParams using a row range.
 * Accepts a single Excel row (e.g., A2:F2) with required inputs.
 * @customfunction
 * @namespace ENVIZI
 * @param row A row with [date, country, stateProvince, fuelName, fuelAmount, fuelUnit]
 * @returns A 2D array with emission data or error details
 */
export async function v3_location(row: any[][]): Promise<string[][]> {
  try {
    const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;

    if (flat.length < 7) {
      return [[
        "Error: Incomplete input",
        "Expected 6 fields: date, country, stateProvince, energyConsumed, commodity, unit , includedetails "
      ]];
    }

    const [
      date,
      country,
      stateProvince,
      energyConsumed,
      commodity,
      unit,
      includeDetails
    ] = flat;

    return await v3_location_helper(
      String(date),
      String(country),
      String(stateProvince),
      Number(energyConsumed),
      String(commodity),
      String(unit),
      Boolean(includeDetails)
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


/**
 * Tests if fetch works inside Excel custom function runtime.
 * @customfunction
 * @namespace ENVIZI
 * @returns A 2D array showing success or error from fetch call
 */
export async function testFetchInExcel(): Promise<string[][]> {
  try {
    const response = await fetch("https://api.agify.io?name=michael");

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const data: {
      name: string;
      age: number;
      count: number;
    } = await response.json();

    return [[
      "Fetch call successful",
      "Name: " + data.name,
      "Predicted Age: " + data.age.toString(),
      "Count: " + data.count.toString()
    ]];
  } catch (error: unknown) {
    let message = "Unknown error";
    if (error instanceof Error) {
      message = error.message;
    }

    return [[
      "Fetch call failed",
      message
    ]];
  }
}

// import axios from "axios";

// /**
//  * Tests if axios works inside Excel custom function runtime.
//  * @customfunction
//  * @namespace ENVIZI
//  * @returns A 2D array showing success or error from axios call
//  */
// export async function testAxiosInExcel(): Promise<string[][]> {
//   try {
//     const response = await axios.get<{
//       name: string;
//       age: number;
//       count: number;
//     }>("https://api.agify.io?name=michael");

//     const data = response.data;

//     return [[
//       "Axios call successful",
//       "Name: " + data.name,
//       "Predicted Age: " + data.age.toString(),
//       "Count: " + data.count.toString()
//     ]];
//   } catch (error: unknown) {
//     let message = "Unknown error";

//     if (
//       typeof error === "object" &&
//       error !== null &&
//       "message" in error
//     ) {
//       message = (error as any).message;
//     }

//     return [[
//       "Axios call failed",
//       message
//     ]];
//   }
// }

