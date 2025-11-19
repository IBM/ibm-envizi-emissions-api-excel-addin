// Copyright IBM Corp. 2025

/**
 * Handles the types function logic for triggering data validation dropdowns
 * Uses shared runtime to directly access Excel.run() API
 */

import { API_COLUMN_MAP, loadAndPopulateApiTypes } from "./api-types-loader";
import { ensureClient } from "./client";

/**
 * Sheet name where API types are stored
 */
const API_TYPES_SHEET_NAME = "API_Types_Data";

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
 * Checks if the API types sheet exists
 * @returns Promise<boolean> indicating if the sheet exists
 */
async function apiTypesSheetExists(): Promise<boolean> {
  return Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    sheets.load("items/name");
    await context.sync();
    
    const sheet = sheets.items.find((s) => s.name === API_TYPES_SHEET_NAME);
    return !!sheet;
  });
}

/**
 * Ensures the API types sheet exists, creating it if necessary
 */
async function ensureApiTypesSheet(): Promise<void> {
  const sheetExists = await apiTypesSheetExists();
  if (!sheetExists) {
    await loadAndPopulateApiTypes();
  }
}

/**
 * Applies data validation to a cell based on API types from the hidden sheet
 * @param cellAddress The address of the cell to apply validation to (e.g., "Sheet1!A1")
 * @param apiName The normalized API name (lowercase)
 */
async function applyDataValidation(cellAddress: string, apiName: string): Promise<void> {
  await Excel.run(async (context) => {
    // Get the column index for this API
    const columnIndex = API_COLUMN_MAP[apiName];
    if (columnIndex === undefined) {
      throw new Error(`Unknown API name: ${apiName}`);
    }

    // Get the API types sheet
    const apiTypesSheet = context.workbook.worksheets.getItem(API_TYPES_SHEET_NAME);
    
    // Get the column letter (A=0, B=1, etc.)
    const columnLetter = String.fromCharCode(65 + columnIndex);
    
    // Get the entire column to find the last row with data
    const column = apiTypesSheet.getRange(`${columnLetter}:${columnLetter}`);
    const usedRange = column.getUsedRange();
    usedRange.load("rowCount");
    await context.sync();
    
    const rowCount = usedRange.rowCount;
    
    if (rowCount <= 1) {
      throw new Error(`No types found for API: ${apiName}`);
    }
    
    // Get the actual data range (excluding header)
    const dataRange = apiTypesSheet.getRange(`${columnLetter}2:${columnLetter}${rowCount}`);
    dataRange.load("values");
    await context.sync();
    
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
    
    // Get the values from the data range and create a comma-separated list
    const values = dataRange.values.flat().filter(v => v !== null && v !== "");
    const valuesList = values.join(",");
    
    // Apply list validation using the values directly
    targetCell.dataValidation.rule = {
      list: {
        inCellDropDown: true,
        source: valuesList,
      },
    };
    
    targetCell.dataValidation.errorAlert = {
      showAlert: true,
      style: Excel.DataValidationAlertStyle.stop,
      title: "Invalid Type",
      message: "Please select a valid type from the dropdown list",
    };
    
    await context.sync();
  });
}

/**
 * Main logic for the types function
 * Uses shared runtime to directly access Excel API
 * @param apiName The name of the API
 * @param invocation Invocation object to get cell address
 * @returns Empty string (cell will have dropdown validation)
 */
export async function handleTypesFunction(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Ensure client is initialized (will check login and load credentials)
    await ensureClient();
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Ensure API types sheet exists (create if needed)
    await ensureApiTypesSheet();
    
    // Apply data validation directly using shared runtime
    await applyDataValidation(invocation.address, normalizedApiName);
    
    // Return empty string so cell remains empty after validation is applied
    return "";
  } catch (error) {
    if (error instanceof CustomFunctions.Error) {
      throw error;
    }
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      `Failed to set up validation: ${error.message || "Unknown error"}`
    );
  }
}


