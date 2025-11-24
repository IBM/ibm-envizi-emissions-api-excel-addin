// Copyright IBM Corp. 2025

/**
 * Handles loading and populating area data (countries, states, power grids) from APIs
 */

import { API_AREA_CONFIGS } from "./metadata-utils";

/**
 * Sheet name where area data is stored
 */
export const AREA_DATA_SHEET_NAME = "API_Area_Data";

/**
 * Column indices for the area data sheet
 */
export const AREA_COLUMN_MAP = {
  apiName: 0,      // Column A
  alpha3: 1,       // Column B
  countryName: 2,  // Column C
  stateProvince: 3, // Column D (comma-separated)
  powerGrid: 4,    // Column E (comma-separated)
};

/**
 * Interface for location data from API
 */
interface LocationData {
  alpha3: string;
  countryName: string;
  stateProvinces?: string[];
  powerGrids?: string[];
}

/**
 * Interface for API response
 */
interface AreaResponse {
  locations: LocationData[];
}

/**
 * Fetches area data for all APIs
 * @returns Promise<Map<string, LocationData[]>> Map of API name to location data
 */
async function fetchAllAreaData(): Promise<Map<string, LocationData[]>> {
  const areaDataMap = new Map<string, LocationData[]>();

  // Fetch data for each API
  const fetchPromises = API_AREA_CONFIGS.map(async (config) => {
    try {
      const rawResponse = await config.class.getArea();
      
      // Parse JSON response if it's a string, otherwise use as-is
      const response: AreaResponse = typeof rawResponse === 'string'
        ? JSON.parse(rawResponse)
        : rawResponse as AreaResponse;
      
      if (!response?.locations || !Array.isArray(response.locations)) {
        console.error(`Invalid response format from ${config.name} API`);
        return { name: config.name, locations: [] };
      }
      
      return { name: config.name, locations: response.locations };
    } catch (error) {
      console.error(`Error fetching area data for ${config.name}:`, error);
      return { name: config.name, locations: [] };
    }
  });

  const results = await Promise.all(fetchPromises);
  
  // Store results in map
  results.forEach((result) => {
    areaDataMap.set(result.name, result.locations);
  });

  // Note: factor and factorsearch are NOT stored in the sheet
  // They will be handled by area-handler to use calculation data dynamically

  return areaDataMap;
}

/**
 * Writes area data to Excel sheet
 * @param areaDataMap Map of API name to location data
 */
async function writeAreaDataToSheet(areaDataMap: Map<string, LocationData[]>): Promise<void> {
  await Excel.run(async (context) => {
    const sheets = context.workbook.worksheets;
    
    // Check if sheet already exists
    sheets.load("items/name");
    await context.sync();
    
    let sheet = sheets.items.find((s) => s.name === AREA_DATA_SHEET_NAME);
    
    if (sheet) {
      // Sheet exists, clear it
      sheet.delete();
      await context.sync();
    }
    
    // Create new sheet
    sheet = sheets.add(AREA_DATA_SHEET_NAME);
    
    // Make sheet hidden (backend data sheet)
    sheet.visibility = Excel.SheetVisibility.hidden;
    
    // Prepare data rows
    const rows: any[][] = [];
    
    // Add header row
    rows.push(["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"]);
    
    // Add data rows for each API
    areaDataMap.forEach((locations, apiName) => {
      locations.forEach((location) => {
        const stateProvinces = location.stateProvinces?.join(", ") || "";
        const powerGrids = location.powerGrids?.join(", ") || "";
        
        rows.push([
          apiName,
          location.alpha3,
          location.countryName || "", // Ensure empty string instead of undefined
          stateProvinces,
          powerGrids,
        ]);
      });
    });
    
    // Write data to sheet
    const range = sheet.getRangeByIndexes(0, 0, rows.length, 5);
    range.values = rows;
    
    // Format header row
    const headerRange = sheet.getRangeByIndexes(0, 0, 1, 5);
    headerRange.format.font.bold = true;
    headerRange.format.fill.color = "#4472C4";
    headerRange.format.font.color = "white";
    
    // Auto-fit columns
    sheet.getUsedRange().format.autofitColumns();
    
    await context.sync();
    
    console.log(`Successfully wrote area data to sheet: ${AREA_DATA_SHEET_NAME}`);
  });
}

/**
 * Loads and populates area data from all APIs into Excel sheet
 * This function should be called when area data is needed
 */
export async function loadAndPopulateAreaData(): Promise<void> {
  try {
    console.log("Fetching area data from APIs...");
    const areaDataMap = await fetchAllAreaData();
    
    console.log("Writing area data to Excel sheet...");
    await writeAreaDataToSheet(areaDataMap);
    
    console.log("Area data loaded successfully!");
  } catch (error) {
    console.error("Error loading area data:", error);
    throw error;
  }
}


