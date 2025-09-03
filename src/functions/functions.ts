// Copyright IBM Corp. 2025

import { genericApiCall } from "./generic-api-call";

/**
 * Calculates location-based emissions.
 * @customfunction
 */
export async function location(
  value: number,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string,
  type?: string,
  factorId?: number,
  unit?: string
): Promise<any[][]> {
  return genericApiCall("location", {
    type,
    factorId,
    value,
    unit,
    country,
    stateProvince,
    date,
    powerGrid,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 */
export async function stationary(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number
): Promise<any[][]> {
  return genericApiCall("stationary", {
    type,
    factorId,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 */
export async function fugitive(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number
): Promise<any[][]> {
  return genericApiCall("fugitive", { type, factorId, value, unit, country, stateProvince, date });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 */
export async function mobile(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number
): Promise<any[][]> {
  return genericApiCall("mobile", { type, factorId, value, unit, country, stateProvince, date });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 */
export async function calculation(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  powerGrid?: string,
  type?: string,
  factorId?: number
): Promise<any[][]> {
  return genericApiCall("calculation", {
    type,
    factorId,
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
export async function transportation_and_distribution(
  value: number,
  unit: string,
  country: string,
  stateProvince?: string,
  date?: string,
  type?: string,
  factorId?: number
): Promise<any[][]> {
  return genericApiCall("transportation_and_distribution", {
    type,
    factorId,
    value,
    unit,
    country,
    stateProvince,
    date,
  });
}
