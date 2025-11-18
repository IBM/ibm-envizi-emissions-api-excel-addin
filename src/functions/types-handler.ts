// Copyright IBM Corp. 2025

/**
 * Handles the types function logic for triggering data validation dropdowns
 */

import { getApiCredentials } from "../common/credentials";

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
 * Stores validation request in Office settings
 * @param cellAddress The cell address where validation should be applied
 * @param apiName The normalized API name
 */
export function storeValidationRequest(cellAddress: string, apiName: string): void {
  // Store validation request in Office settings (synchronous operation)
  Office.context.document.settings.set("validationRequest", {
    cellAddress,
    apiName,
    timestamp: Date.now(),
  });
  
  // Save settings asynchronously with callback
  Office.context.document.settings.saveAsync((result) => {
    if (result.status === Office.AsyncResultStatus.Failed) {
      console.error("Failed to save validation request:", result.error);
    }
  });
}

/**
 * Main logic for the types function
 * @param apiName The name of the API
 * @param invocation Invocation object to get cell address
 * @returns The API name as the cell value
 */
export async function handleTypesFunction(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Check if user is logged in
    const credentials = getApiCredentials();
    if (!credentials) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        "Please log in first to use the TYPES function"
      );
    }
    
    // Validate API name
    const normalizedApiName = validateApiName(apiName);
    
    // Get cell address
    const cellAddress = invocation.address;
    
    // Store validation request with a flag to ensure sheet creation
    storeValidationRequest(cellAddress, normalizedApiName);
    
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


