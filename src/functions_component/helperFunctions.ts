import { genericApiCall } from "./genericApiCall";



/**
 * Calculates location-based emissions.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_location_helper(
  date: string,
  country: string,
  stateProvince: string,
  powerGrid: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  const state = stateProvince || "";
  const grid = powerGrid || "";
  return genericApiCall("location", {
    date,
    country,
    stateProvince: state,
    powerGrid: grid,
    type,
    value,
    unit,
  });
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_stationary_helper(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  return genericApiCall("stationary", { date, country, stateProvince, type, value, unit });
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_fugitive_helper(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  return genericApiCall("fugitive", { date, country, stateProvince, type, value, unit });
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_mobile_helper(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  return genericApiCall("mobile", { date, country, stateProvince, type, value, unit });
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_calculation_helper(
  date: string,
  country: string,
  stateProvince: string,
  powerGrid: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  const state = stateProvince || "";
  const grid = powerGrid || "";
  return genericApiCall("calculation", {
    date,
    country,
    stateProvince: state,
    powerGrid: grid,
    type,
    value,
    unit,
  });
}