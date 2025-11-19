// Copyright IBM Corp. 2025

/**
 * Shared utilities for validation handlers
 */

/**
 * Valid API names supported by the system
 */
export const VALID_API_NAMES = [
  "location",
  "mobile",
  "fugitive",
  "stationary",
  "calculation",
  "transportationanddistribution",
  "factor",
] as const;

/**
 * Validates if the provided API name is valid
 * @param apiName The API name to validate
 * @returns The normalized API name if valid
 * @throws CustomFunctions.Error if invalid
 */
export function validateApiName(apiName: string): string {
  const normalizedApiName = apiName.toLowerCase().trim();
  
  if (!VALID_API_NAMES.includes(normalizedApiName as any)) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.invalidValue,
      `Invalid API name. Valid options: ${VALID_API_NAMES.join(", ")}`
    );
  }
  
  return normalizedApiName;
}

/**
 * Gets the target cell from a cell address
 * @param context Excel context
 * @param cellAddress The address of the cell (e.g., "Sheet1!A1" or "A1")
 * @returns The target Excel.Range
 */
export async function getTargetCell(
  context: Excel.RequestContext,
  cellAddress: string
): Promise<Excel.Range> {
  // Parse the cell address to get sheet name and cell reference
  const [sheetName, cellRef] = cellAddress.includes("!")
    ? cellAddress.split("!")
    : ["", cellAddress];
  
  // Get the target cell
  if (sheetName) {
    const targetSheet = context.workbook.worksheets.getItem(sheetName);
    return targetSheet.getRange(cellRef);
  } else {
    // If no sheet name, use active sheet
    const activeSheet = context.workbook.worksheets.getActiveWorksheet();
    return activeSheet.getRange(cellRef);
  }
}

/**
 * Applies list validation to a cell
 * @param targetCell The cell to apply validation to
 * @param values Array of values for the dropdown
 * @param title Error alert title
 * @param message Error alert message
 */
export function applyListValidation(
  targetCell: Excel.Range,
  values: string[],
  title: string,
  message: string
): void {
  // Clear any existing validation
  targetCell.dataValidation.clear();
  
  // Create comma-separated list
  const valuesList = values.join(",");
  
  // Apply list validation
  targetCell.dataValidation.rule = {
    list: {
      inCellDropDown: true,
      source: valuesList,
    },
  };
  
  targetCell.dataValidation.errorAlert = {
    showAlert: true,
    style: Excel.DataValidationAlertStyle.stop,
    title,
    message,
  };
}

/**
 * Handles errors in custom functions, re-throwing CustomFunctions.Error as-is
 * @param error The error to handle
 * @param defaultMessage Default error message if not a CustomFunctions.Error
 * @throws CustomFunctions.Error
 */
export function handleCustomFunctionError(error: unknown, defaultMessage: string): never {
  // Re-throw CustomFunctions.Error as-is
  if (error instanceof CustomFunctions.Error || (error as any)?.name === "CustomFunctions.Error") {
    throw error;
  }
  throw new CustomFunctions.Error(
    CustomFunctions.ErrorCode.notAvailable,
    `${defaultMessage}: ${(error as any)?.message || "Unknown error"}`
  );
}


