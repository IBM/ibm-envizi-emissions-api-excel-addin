// Copyright IBM Corp. 2025

import { API_COLUMN_MAP } from "../functions/api-types-loader";

/**
 * Sheet name where API types are stored
 */
const API_TYPES_SHEET_NAME = "API_Types_Data";

/**
 * Interface for validation request stored in settings
 */
interface ValidationRequest {
  cellAddress: string;
  apiName: string;
  timestamp: number;
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
      console.error(`Unknown API name: ${apiName}`);
      return;
    }

    // Get the API types sheet
    const apiTypesSheet = context.workbook.worksheets.getItem(API_TYPES_SHEET_NAME);
    
    // Get the column letter (A=0, B=1, etc.)
    const columnLetter = String.fromCharCode(65 + columnIndex);
    
    // Get the entire column to find the last row with data
    const column = apiTypesSheet.getRange(`${columnLetter}:${columnLetter}`);
    const usedRange = column.getUsedRange();
    usedRange.load("rowCount, address");
    await context.sync();
    
    const rowCount = usedRange.rowCount;
    
    if (rowCount <= 1) {
      console.warn(`No types found for API: ${apiName}`);
      return;
    }
    
    // Get the actual data range (excluding header)
    const dataRange = apiTypesSheet.getRange(`${columnLetter}2:${columnLetter}${rowCount}`);
    dataRange.load("address, values");
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
    
    console.log(`Data validation applied to ${cellAddress} for API: ${apiName} with ${values.length} types`);
  });
}

/**
 * Processes a validation request from Office settings
 * @param request The validation request to process
 */
async function processValidationRequest(request: ValidationRequest): Promise<void> {
  try {
    await applyDataValidation(request.cellAddress, request.apiName);
  } catch (error) {
    console.error("Error applying data validation:", error);
    throw error;
  }
}

/**
 * Settings change handler that processes validation requests
 */
async function onSettingsChanged(): Promise<void> {
  try {
    const request = Office.context.document.settings.get("validationRequest") as ValidationRequest;
    
    if (!request) {
      return;
    }
    
    // Process the request
    await processValidationRequest(request);
    
    // Clear the request after processing (synchronous operation)
    Office.context.document.settings.remove("validationRequest");
    
    // Save settings asynchronously with callback
    Office.context.document.settings.saveAsync((result) => {
      if (result.status === Office.AsyncResultStatus.Failed) {
        console.error("Failed to save settings after clearing validation request:", result.error);
      }
    });
    
  } catch (error) {
    console.error("Error in settings change handler:", error);
  }
}

/**
 * Initializes the validation handler by setting up the settings change listener
 */
export function initializeValidationHandler(): void {
  // Add handler for settings changes
  Office.context.document.settings.addHandlerAsync(
    Office.EventType.SettingsChanged,
    onSettingsChanged,
    (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Validation handler initialized successfully");
      } else {
        console.error("Failed to initialize validation handler:", result.error);
      }
    }
  );
  
  // Check for any pending requests on initialization
  onSettingsChanged();
}

/**
 * Removes the validation handler
 */
export function removeValidationHandler(): void {
  Office.context.document.settings.removeHandlerAsync(
    Office.EventType.SettingsChanged,
    { handler: onSettingsChanged },
    (result) => {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        console.log("Validation handler removed successfully");
      } else {
        console.error("Failed to remove validation handler:", result.error);
      }
    }
  );
}

// Made with Bob
