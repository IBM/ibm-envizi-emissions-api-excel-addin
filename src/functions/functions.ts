// Copyright IBM Corp. 2025

import { genericApiCall } from "./generic-api-call";

/**
 * Calculates location-based emissions.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function location(
  value: number,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string,
  type?: string,
  factorId?: number,
  unit?: string,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "location",
    {
      type,
      factorId,
      value,
      unit,
      country,
      stateProvince,
      date,
      powerGrid,
    },
    invocation
  );
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function stationary(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "stationary",
    { type, factorId, value, unit, country, stateProvince, date },
    invocation
  );
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function fugitive(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "fugitive",
    { type, factorId, value, unit, country, stateProvince, date },
    invocation
  );
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function mobile(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "mobile",
    { type, factorId, value, unit, country, stateProvince, date },
    invocation
  );
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function calculation(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string,
  type?: string,
  factorId?: number,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "calculation",
    {
      type,
      factorId,
      value,
      unit,
      country,
      stateProvince,
      date,
      powerGrid,
    },
    invocation
  );
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function transportation_and_distribution(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number,
  invocation?
): Promise<any[][]> {
  return genericApiCall(
    "transportation_and_distribution",
    {
      type,
      factorId,
      value,
      unit,
      country,
      stateProvince,
      date,
    },
    invocation
  );
}
