// Copyright IBM Corp. 2025

import { genericApiCall } from "./generic-api-call";
import { factorSearch } from "./factorSearchHelper";
import { factorHelper } from "./factorHelper";

/**
 * Triggers data validation dropdown for API types.
 * Returns the API name and stores a request for the taskpane to apply validation.
 * @customfunction
 * @param apiName The name of the API (location, mobile, fugitive, stationary, calculation, transportationanddistribution)
 * @param invocation Invocation object to get cell address
 * @requiresAddress
 */
export async function types(
  apiName: string,
  invocation: CustomFunctions.Invocation
): Promise<string> {
  try {
    // Normalize API name to lowercase for case-insensitive matching
    const normalizedApiName = apiName.toLowerCase().trim();
    
    // Validate API name
    const validApiNames = [
      "location",
      "mobile",
      "fugitive",
      "stationary",
      "calculation",
      "transportationanddistribution",
    ];
    
    if (!validApiNames.includes(normalizedApiName)) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.invalidValue,
        `Invalid API name. Valid options: ${validApiNames.join(", ")}`
      );
    }

    // Get cell address
    const cellAddress = invocation.address;
    
    // Store validation request in Office settings
    await Office.context.document.settings.set("validationRequest", {
      cellAddress,
      apiName: normalizedApiName,
      timestamp: Date.now(),
    });
    
    // Save settings
    await Office.context.document.settings.saveAsync();
    
    // Return the API name as the cell value
    return apiName;
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

/**
 * Calculates location-based emissions.
 * @customfunction
 */
export async function location(
  type: string,
  value: number,
  unit: string | undefined,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string
): Promise<any[][]> {
  const finalUnit = unit || "kwh";
  return genericApiCall("location", {
    type,
    value,
    unit: finalUnit,
    country,
    stateProvince,
    date,
    powerGrid,
  });
}

/**
 * Calculates location-based emissions.
 * @customfunction
 */
export async function location_by_factorId(
  factorId: number,
  value: number,
  unit?: string
): Promise<any[][]> {
  return genericApiCall("location", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 */
export async function stationary(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("stationary", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 */
export async function stationary_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("stationary", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 */
export async function fugitive(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("fugitive", { type, value, unit, country, stateProvince, date });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 */
export async function fugitive_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("fugitive", { factorId, value, unit });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 */
export async function mobile(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("mobile", { type, value, unit, country, stateProvince, date });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 */
export async function mobile_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("mobile", { factorId, value, unit });
}

/**
 * Calculates emissions using the transportation and distribution endpoint.
 * @customfunction
 */
export async function transportation_and_distribution(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return genericApiCall("transportation_and_distribution", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates emissions using the transportation and distribution endpoint.
 * @customfunction
 */
export async function transportation_and_distribution_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("transportation_and_distribution", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 */
export async function calculation(
  type: string,
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string
): Promise<any[][]> {
  return genericApiCall("calculation", {
    type,
    value,
    unit,
    country,
    stateProvince,
    date,
    powerGrid,
  });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 */
export async function calculation_by_factorId(
  factorId: number,
  value: number,
  unit: string
): Promise<any[][]> {
  return genericApiCall("calculation", {
    factorId,
    value,
    unit,
  });
}

/**
 * Calculates emissions using the factor search endpoint.
 * @customfunction
 */
export async function factor_search(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string,
  page?: number,
  size?: number
): Promise<any[][]> {
  return factorSearch(search, country, stateProvince, date, page, size);
}

/**
 * Calculates emissions using the factor endpoint.
 * @customfunction
 */
export async function factor(
  type: string,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  return factorHelper(type, unit, country, stateProvince, date);
}

/**
 * Calculates emissions using the factor endpoint.
 * @customfunction
 */
export async function factor_by_id(factorId: number, unit?: string): Promise<any[][]> {
  return factorHelper(factorId, unit);
}
