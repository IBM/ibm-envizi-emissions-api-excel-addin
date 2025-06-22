/* global clearInterval, console, CustomFunctions, setInterval */

/**
 * Adds two numbers.
 * @customfunction
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
export function add(first: number, second: number): number {
  return first + second;
}

/**
 * Displays the current time once a second.
 * @customfunction
 * @param invocation Custom function handler
 */
export function clock(invocation: CustomFunctions.StreamingInvocation<string>): void {
  const timer = setInterval(() => {
    const time = currentTime();
    invocation.setResult(time);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time.
 * @returns String with the current time formatted for the current locale.
 */
export function currentTime(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction
 * @param incrementBy Amount to increment
 * @param invocation Custom function handler
 */
export function increment(
  incrementBy: number,
  invocation: CustomFunctions.StreamingInvocation<number>
): void {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    invocation.setResult(result);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Writes a message to console.log().
 * @customfunction LOG
 * @param message String to write.
 * @returns String to write.
 */
export function logMessage(message: string): string {
  console.log(message);

  return message;
}


/**
 * Sends a POST request to the carbon API with auth headers and returns emission data.
 * @customfunction
 * @param date Date in YYYY-MM-DD format
 * @param country Country name
 * @param stateProvince State or province
 * @param energyConsumed Amount of energy consumed
 * @param unit Unit of energy (e.g., kwh)
 * @param commodity Type of commodity (e.g., electricity)
 * @param includeDetails Include detailed response
 * @param token Bearer token for Authorization header
 * @returns A 2D array with result fields
 */
export async function calculateCarbonFootprint(
  date: string,
  country: string,
  stateProvince: string,
  energyConsumed: number,
  unit: string,
  commodity: string,
  includeDetails: boolean,
  token: string
): Promise<string[][]> {
  const payload = {
    customID: { id: "string" },
    onBehalfOfClient: {
      companyId: "string",
      companyName: "string",
    },
    organisation: {
      departmentId: "string",
      departmentName: "string",
    },
    requestType: "ACTUAL",
    location: {
      country,
      stateProvince,
      zipPostCode: "string",
      city: "string",
    },
    site: {
      siteId: "string",
      siteName: "string",
      buildingId: "string",
      buildingName: "string",
    },
    timePeriod: {
      year: new Date(date).getFullYear(),
      month: new Date(date).getMonth() + 1,
    },
    activityData: {
      sector: "Energy",
      fuelName: commodity,
      fuelAmount: String(energyConsumed),
      fuelUnit: unit,
      hvBasis: "Not applicable",
    },
  };

  try {
    const response = await fetch("https://foundation-staging.agtech.ibm.com/v2/carbon/stationary", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      return [[
        `Error: ${response.status}`,
        responseText,
        JSON.stringify(payload),
        "", "", "", "" // padding to match column count
      ]];
    }

    const data = JSON.parse(responseText);

    return [[
      String(data.CO2e),
      String(data.CH4),
      String(data.N2O),
      String(data.fossilFuelCO2),
      String(data.biogenicCO2),
      data.unitOfMeasurement,
      data.description,
    ]];
  } catch (error: any) {
    return [[
      error?.message || "Unknown error",
      JSON.stringify(payload),
      "", "", "", "", ""
    ]];
  }
}

/**
 * Wrapper to call calculateCarbonFootprint by passing a row range (e.g., A2:H2)
 * @customfunction
 * @param row A row array range from the sheet, e.g., A2:H2
 * @returns A 2D array with CO2e results
 */
export async function calculateCarbonFootprintRow(row: any[][]): Promise<string[][]> {
  try {
    const flat = Array.isArray(row) && Array.isArray(row[0]) ? row[0] : row;

    if (flat.length < 8) {
      return [["Error: Expected 8 columns in the input row"]];
    }

    const [
      date,
      country,
      stateProvince,
      energyConsumed,
      unit,
      commodity,
      includeDetails,
      token
    ] = flat;

    return await calculateCarbonFootprint(
      String(date),
      String(country),
      String(stateProvince),
      Number(energyConsumed),
      String(unit),
      String(commodity),
      includeDetails === true || String(includeDetails).toLowerCase() === "true",
      String(token)
    );
  } catch (err: any) {
    return [[
      "Error in wrapper",
      err?.message || JSON.stringify(err),
      "", "", "", "", ""
    ]];
  }
}


