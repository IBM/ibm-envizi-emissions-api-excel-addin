import { Client, LocationApi , MobileApi, FugitiveApi , StationaryApi , GenericCalculation  } from 'ibm-ghg-sdk';
// @ts-ignore
import { Buffer } from 'buffer';

// Excel custom functions runtime doesn't define Buffer. Patch it.
if (typeof globalThis.Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}




// prakhar

function convertExcelDateToISO(input: string): string {
  const trimmed = input.trim();

  // Case 1: Already in ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 2: Excel serial date (e.g., 44562)
  const asNumber = parseFloat(trimmed);
  if (!isNaN(asNumber) && asNumber > 20000) {
    const date = new Date(Math.round((asNumber - 25569) * 86400 * 1000));
    return date.toISOString().split("T")[0];
  }

  // Case 3: DD/MM/YYYY or MM/DD/YYYY
  const parts = trimmed.split(/[\/\-]/);
  if (parts.length === 3) {
    let [day, month, year] = parts.map((p) => parseInt(p, 10));

    // Handle MM/DD/YYYY (US style)
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }

    if (year < 100) year += 2000; // handle 2-digit years

    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  return "Invalid date";
}


async function genericApiCall(
  apiType: 'location' | 'stationary' | 'fugitive' | 'mobile'| 'calculation',
  payload: {
    date: string,
    country: string,
    stateProvince: string,
    type: string,
    value: number,
    unit: string
  }
): Promise<string[]> {
  try {
    const formattedDate = convertExcelDateToISO(payload.date);
    console.log("Date input:", payload.date);
console.log("Formatted date:", formattedDate);

    if (!OfficeRuntime?.storage) return ["Error", "OfficeRuntime.storage not available"];

    const apiKey = await OfficeRuntime.storage.getItem("apiKey");
    const clientId = await OfficeRuntime.storage.getItem("clientId");

    if (!apiKey || !clientId) {
      return ["Error", `Missing apiKey/clientId: apiKey=${!!apiKey}, clientId=${!!clientId}`];
    }

    await Client.getClient({ apiKey, clientId });

    const apiParams = {
      location: { country: payload.country, stateProvince: payload.stateProvince },
      time: { date: formattedDate },
      activity: { type: payload.type, value: payload.value, unit: payload.unit },
      includeDetails: false,
    };

    let response: any;
    switch (apiType) {
      case 'location': response = await LocationApi.calculate(apiParams, true); break;
      case 'stationary': response = await StationaryApi.calculate(apiParams, true); break;
      case 'fugitive': response = await FugitiveApi.calculate(apiParams, true); break;
      case 'mobile': response = await MobileApi.calculate(apiParams, true); break;
      case 'calculation': response = await GenericCalculation.calculate(apiParams, true); break;
      default: return ["Error", `Unsupported API type: ${apiType}`];
    }

    if (!response || typeof response !== 'object') {
      return ["Error", "Invalid API response"];
    }

    
    return Object.entries(response).map(([k, v]) => `${v}`);
  } catch (e: any) {
    return ["Error", e?.message || String(e)];
  }
}

/**
 * Calculates location-based emissions.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_location_helper(
  date: string,
  country: string,
  stateProvince: string,
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  return genericApiCall("location", { date, country, stateProvince, type, value, unit });
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
  type: string,
  value: number,
  unit: string
): Promise<string[]> {
  return genericApiCall("calculation", { date, country, stateProvince, type, value, unit });
}


/**
 * Wrapper for location emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_location(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6) return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_location_helper(String(date), String(country), String(stateProvince), String(type), Number(value), String(unit));
  return [result];
}

/**
 * Wrapper for stationary emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_stationary(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6) return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_stationary_helper(String(date), String(country), String(stateProvince), String(type), Number(value), String(unit));
  return [result];
}

/**
 * Wrapper for fugitive emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_fugitive(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6) return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_fugitive_helper(String(date), String(country), String(stateProvince), String(type), Number(value), String(unit));
  return [result];
}

/**
 * Wrapper for mobile emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_mobile(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6) return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_mobile_helper(String(date), String(country), String(stateProvince), String(type), Number(value), String(unit));
  return [result];
}
/**
 * Wrapper for generic emission calculation.
 * @customfunction
 * @namespace ENVIZI
 */
export async function v3_calculation(row: any[][]): Promise<string[][]> {
  const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;
  if (flat.length < 6) return [["Error", "Expected 6 fields: date, country, stateProvince, type, value, unit"]];
  const [date, country, stateProvince, type, value, unit] = flat;
  const result = await v3_calculation_helper(String(date), String(country), String(stateProvince), String(type), Number(value), String(unit));
  return [result];
}
