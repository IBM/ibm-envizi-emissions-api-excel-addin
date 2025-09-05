// Copyright IBM Corp. 2025

import { genericApiCall } from "./generic-api-call";

/**
 * Calculates location-based emissions.
 * @customfunction
 */
export async function location(
  type: string,
  value: number,
  country: string,
  stateProvince?: string,
  date?: string,
  unit?: string,
  powerGrid?: string
): Promise<any[][]> {
  return genericApiCall("location", {
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
 * Calculates emissions using the generic calculation endpoint.
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
 * Calculates emissions using the generic calculation endpoint.
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
