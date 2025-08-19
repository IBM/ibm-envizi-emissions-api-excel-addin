import { genericApiCall } from "./genericApiCall";

/**
 * Calculates location-based emissions.
 * @customfunction
 * @namespace ENVIZI
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function location(
  date: string,
  country: string,
  stateProvince: string,
  powerGrid: string,
  type: string,
  value: number,
  unit: string,
  invocation?
): Promise<string[][]> {
  const response = await genericApiCall(
    "location",
    {
      date,
      country,
      stateProvince,
      powerGrid,
      type,
      value,
      unit,
    },
    invocation
  );

  return response;
}

/**
 * Calculates stationary source emissions.
 * @customfunction
 * @namespace ENVIZI
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function stationary(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string,
  invocation?
): Promise<string[][]> {
  return genericApiCall(
    "stationary",
    { date, country, stateProvince, type, value, unit },
    invocation
  );
}

/**
 * Calculates fugitive emissions.
 * @customfunction
 * @namespace ENVIZI
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function fugitive(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string,
  invocation?
): Promise<string[][]> {
  return genericApiCall(
    "fugitive",
    { date, country, stateProvince, type, value, unit },
    invocation
  );
}

/**
 * Calculates mobile source emissions.
 * @customfunction
 * @namespace ENVIZI
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function mobile(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string,
  invocation?
): Promise<string[][]> {
  return genericApiCall("mobile", { date, country, stateProvince, type, value, unit }, invocation);
}

/**
 * Calculates emissions using the generic calculation endpoint.
 * @customfunction
 * @namespace ENVIZI
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export async function calculation(
  date: string,
  country: string,
  stateProvince: string,
  powerGrid: string,
  type: string,
  value: number,
  unit: string,
  invocation?
): Promise<string[][]> {
  return genericApiCall(
    "calculation",
    {
      date,
      country,
      stateProvince,
      powerGrid,
      type,
      value,
      unit,
    },
    invocation
  );
}
