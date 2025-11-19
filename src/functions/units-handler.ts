// Copyright IBM Corp. 2025

/**
 * Handles the units function logic for triggering data validation dropdowns
 * Uses shared runtime to directly access Excel.run() API
 * Makes on-demand API calls to fetch units for each API type
 */

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
  Factor,
} from "emissions-api-sdk";
import { ensureClient } from "./client";

/**
 * Map of API names to their SDK classes
 */
const API_CLASS_MAP = {
  location: Location,
  mobile: Mobile,
  fugitive: Fugitive,
  stationary: Stationary,
  calculation: Calculation,
  transportationanddistribution: TransportationAndDistribution,
  factor: Factor,
};

/**
 * Validates if the provided API name is valid
 * @param apiName The API name to validate
 * @returns The normalized API name if valid
 * @throws CustomFunctions.Error if invalid
 */
export function validateApiName(apiName: string): string {
  const normalizedApiName = apiName.toLowerCase().trim();
  
  const validApiNames = [
    "location",
    "mobile",
    "fugitive",
    "stationary",
    "calculation",
    "transportationanddistribution",
    "factor",
  ];
  
  if (!validApiNames.includes(normalizedApiName)) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Invalid API name. Valid options: ${validApiNames.join(", ")}`
    );
  }
  
  return normalizedApiName;
}

/**
 * Fetches units for a specific API type
 * @param apiName The normalized API name (lowercase)
 * @param type The type parameter to pass to getUnits
 * @returns Array of unit strings
 */
export async function fetchUnits(apiName: string, type: string): Promise<string[]> {
  try {
    const ApiClass = API_CLASS_MAP[apiName];
    if (!ApiClass) {
      throw new Error(`Unknown API name: ${apiName}`);
    }

    // Call the getUnits method with the type parameter
    const response = await ApiClass.getUnits(type);
    
    // The SDK returns a string, but we need to parse it as JSON to get the units array
    let parsedResponse: any;
    try {
      parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    } catch (error) {
      throw new Error(`Failed to parse response from ${apiName} API`);
    }
    
    // Extract units array from response
    if (!parsedResponse || !parsedResponse.units || !Array.isArray(parsedResponse.units)) {
      throw new Error(`Invalid response format from ${apiName} API`);
    }
    
    if (parsedResponse.units.length === 0) {
      throw new Error(`No units found for type: ${type}`);
    }
    
    return parsedResponse.units;
  } catch (error) {
    throw new Error(`Failed to fetch units: ${error.message || "Unknown error"}`);
  }
}

/**
 * Applies data validation to a cell with the provided units
 * @param cellAddress The address of the cell to apply validation to (e.g., "Sheet1!A1")
 * @param units Array of unit strings
 */
async function applyUnitsValidation(cellAddress: string, units: string[]): Promise<void> {
  await Excel.run(async (context) => {
    // Parse the cell address to get sheet name and cell reference
    const [sheetName, cellRef] = cellAddress.includes("!")
      ? cellAddress.split("!")
      : ["", cellAddress];
    
    // Get the target cell
    let targetCell: Excel.Range;
    if (sheetName) {
      const targetSheet = context.workbook.worksheets.getItem(sheetName);
      targetCell = targetSheet.getRange(cellRef);
    } else {
      // If no sheet name, use active sheet
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();
      targetCell = activeSheet.getRange(cellRef);
    }
    
    // Clear any existing validation
    targetCell.dataValidation.clear();
    
    // Create comma-separated list of units
    const unitsList = units.join(",");
    
    // Apply list validation
    targetCell.dataValidation.rule = {
      list: {
        inCellDropDown: true,
        source: unitsList,
      },
    };
    
    targetCell.dataValidation.errorAlert = {
      showAlert: true,
      style: Excel.DataValidationAlertStyle.stop,
      title: "Invalid Unit",
      message: "Please select a valid unit from the dropdown list",
    };
    
    await context.sync();
  });
}

/**
 * Main logic for the units function
 * Uses shared runtime to directly access Excel API
 * Makes on-demand API call to fetch units
 * @param apiName The name of the API
 * @param type The type parameter for getUnits
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleUnitsFunction(
  apiName: string,
  type: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Validate type parameter first (before any async operations)
    if (!type || typeof type !== "string" || type.trim() === "") {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        "Type parameter is required and must be a non-empty string"
      );
    }
    
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Fetch units from API
    const units = await fetchUnits(normalizedApiName, type.trim());
    
    // Apply data validation directly using shared runtime
    await applyUnitsValidation(invocation.address, units);
    
    // Return empty string so cell remains empty after validation is applied
    return "";
  } catch (error) {
    // Re-throw CustomFunctions.Error as-is
    if (error instanceof CustomFunctions.Error || (error as any).name === "CustomFunctions.Error") {
      throw error;
    }
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      `Failed to set up units validation: ${error.message || "Unknown error"}`
    );
  }
}

