// Copyright IBM Corp. 2025

/**
 * Shared utilities and metadata for API operations
 * This module contains common configurations and utilities used across different API handlers
 */

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
} from "emissions-api-sdk";

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
 * API class mapping for metadata operations
 * Maps lowercase API names to their SDK classes
 */
export const API_CLASS_MAP = {
  location: Location,
  mobile: Mobile,
  fugitive: Fugitive,
  stationary: Stationary,
  calculation: Calculation,
  transportationanddistribution: TransportationAndDistribution,
} as const;

/**
 * Configuration for API types operations
 */
export interface ApiTypesConfig {
  name: string;
  getTypes: () => Promise<any>;
}

/**
 * Configuration for API area operations
 */
export interface ApiAreaConfig {
  name: string;
  class: typeof Location | typeof Mobile | typeof Fugitive | typeof Stationary | typeof Calculation | typeof TransportationAndDistribution;
}

/**
 * All available API configurations for types operations
 * Column A: Location, B: Mobile, C: Fugitive, D: Stationary, E: Calculation, F: TransportationAndDistribution
 */
export const API_TYPES_CONFIGS: ApiTypesConfig[] = [
  { name: "Location", getTypes: Location.getTypes },
  { name: "Mobile", getTypes: Mobile.getTypes },
  { name: "Fugitive", getTypes: Fugitive.getTypes },
  { name: "Stationary", getTypes: Stationary.getTypes },
  { name: "Calculation", getTypes: Calculation.getTypes },
  { name: "TransportationAndDistribution", getTypes: TransportationAndDistribution.getTypes },
];

/**
 * All available API configurations for area operations
 * Note: factor and factorsearch are NOT included as they use calculation data
 */
export const API_AREA_CONFIGS: ApiAreaConfig[] = [
  { name: "location", class: Location },
  { name: "mobile", class: Mobile },
  { name: "fugitive", class: Fugitive },
  { name: "stationary", class: Stationary },
  { name: "calculation", class: Calculation },
  { name: "transportationanddistribution", class: TransportationAndDistribution },
];

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

// Made with Bob
