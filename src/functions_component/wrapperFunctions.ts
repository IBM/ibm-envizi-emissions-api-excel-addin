import { v3_calculation_helper, v3_fugitive_helper, v3_location_helper, v3_mobile_helper, v3_stationary_helper } from "./helperFunctions";

/**
 * Wrapper for location emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_location(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 7)
    return [
      ["Error", "Expected 7 fields: date, country, stateProvince, powerGrid, type, value, unit"],
    ];
  const [date, country, stateProvince, powerGrid, type, value, unit] = flat;
  const result = await v3_location_helper(
    String(date),
    String(country),
    String(stateProvince || ""),
    String(powerGrid || ""),
    String(type),
    Number(value),
    String(unit)
  );
  return [result];
}

/**
 * Wrapper for stationary emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_stationary(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6)
    return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_stationary_helper(
    String(date),
    String(country),
    String(stateProvince || ""),
    String(type),
    Number(value),
    String(unit)
  );
  return [result];
}

/**
 * Wrapper for fugitive emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_fugitive(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6)
    return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_fugitive_helper(
    String(date),
    String(country),
    String(stateProvince || ""),
    String(type),
    Number(value),
    String(unit)
  );
  return [result];
}

/**
 * Wrapper for mobile emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_mobile(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6)
    return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_mobile_helper(
    String(date),
    String(country),
    String(stateProvince || ""),
    String(type),
    Number(value),
    String(unit)
  );
  return [result];
}
/**
 * Wrapper for generic emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_calculation(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 7)
    return [
      ["Error", "Expected 6 fields: date, country, stateProvince, powerGrid, type, value, unit"],
    ];
  const [date, country, stateProvince, powerGrid, type, value, unit] = flat;
  const result = await v3_calculation_helper(
    String(date),
    String(country),
    String(stateProvince || ""),
    String(powerGrid || ""),
    String(type),
    Number(value),
    String(unit)
  );
  return [result];
}
