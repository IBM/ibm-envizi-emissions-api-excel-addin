// Copyright IBM Corp. 2025

import {
  loadAndPopulateAreaData,
  AREA_DATA_SHEET_NAME,
  AREA_COLUMN_MAP,
} from "../src/functions/area-loader";

// Mock emissions-api-sdk
jest.mock("emissions-api-sdk", () => ({
  Location: {
    getArea: jest.fn(),
  },
  Mobile: {
    getArea: jest.fn(),
  },
  Fugitive: {
    getArea: jest.fn(),
  },
  Stationary: {
    getArea: jest.fn(),
  },
  Calculation: {
    getArea: jest.fn(),
  },
  TransportationAndDistribution: {
    getArea: jest.fn(),
  },
  Factor: {
    getArea: jest.fn(),
  },
}));

import {
  Location,
  Mobile,
  Fugitive,
  Stationary,
  Calculation,
  TransportationAndDistribution,
  Factor,
} from "emissions-api-sdk";

// Mock client module
jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

import { ensureClient } from "../src/functions/client";

// Mock Excel
const mockAreaDataSheet = {
  name: AREA_DATA_SHEET_NAME,
  getRange: jest.fn(),
  getRangeByIndexes: jest.fn(),
  getUsedRange: jest.fn(),
  visibility: "hidden" as any,
  columns: {
    getItemAt: jest.fn().mockReturnValue({
      format: {
        autofitWidth: jest.fn(),
      },
    }),
  },
};

const mockHeaderRange = {
  values: [["API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"]],
};

const mockDataRange = {
  values: [] as any[][],
  format: {
    font: {
      bold: false,
      color: "black",
    },
    fill: {
      color: "white",
    },
  },
};

const mockContext = {
  workbook: {
    worksheets: {
      add: jest.fn().mockReturnValue(mockAreaDataSheet),
      getItem: jest.fn().mockReturnValue(mockAreaDataSheet),
      load: jest.fn(),
      items: [] as any[],
    },
  },
  sync: jest.fn().mockResolvedValue(undefined),
};

const mockExcelRun = jest.fn((callback) => callback(mockContext));

global.Excel = {
  run: mockExcelRun,
  WorksheetVisibility: {
    visible: "visible",
    hidden: "hidden",
  },
  SheetVisibility: {
    visible: "visible",
    hidden: "hidden",
  },
} as any;

// Mock CustomFunctions
class CustomFunctionsError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "CustomFunctions.Error";
  }
}

global.CustomFunctions = {
  Error: CustomFunctionsError,
  ErrorCode: {
    invalidValue: "InvalidValue",
    notAvailable: "NotAvailable",
  },
} as any;

// Mock console methods to prevent output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe("area-loader", () => {
  const mockEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockLocationGetArea = Location.getArea as jest.MockedFunction<typeof Location.getArea>;
  const mockMobileGetArea = Mobile.getArea as jest.MockedFunction<typeof Mobile.getArea>;
  const mockFugitiveGetArea = Fugitive.getArea as jest.MockedFunction<typeof Fugitive.getArea>;
  const mockStationaryGetArea = Stationary.getArea as jest.MockedFunction<typeof Stationary.getArea>;
  const mockCalculationGetArea = Calculation.getArea as jest.MockedFunction<typeof Calculation.getArea>;
  const mockTransportationGetArea = TransportationAndDistribution.getArea as jest.MockedFunction<
    typeof TransportationAndDistribution.getArea
  >;
  const mockFactorGetArea = Factor.getArea as jest.MockedFunction<typeof Factor.getArea>;

  const mockAreaResponse = {
    locations: [
      {
        alpha3: "USA",
        countryName: "United States",
        stateProvinces: ["California", "Texas", "New York"],
        powerGrids: ["WECC", "ERCOT", "NPCC"],
      },
      {
        alpha3: "CAN",
        countryName: "Canada",
        stateProvinces: ["Ontario", "Quebec", "British Columbia"],
        powerGrids: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: ensureClient succeeds (user is logged in)
    mockEnsureClient.mockResolvedValue(undefined);

    // Default: all getArea calls succeed
    mockLocationGetArea.mockResolvedValue(mockAreaResponse as any);
    mockMobileGetArea.mockResolvedValue(mockAreaResponse as any);
    mockFugitiveGetArea.mockResolvedValue(mockAreaResponse as any);
    mockStationaryGetArea.mockResolvedValue(mockAreaResponse as any);
    mockCalculationGetArea.mockResolvedValue(mockAreaResponse as any);
    mockTransportationGetArea.mockResolvedValue(mockAreaResponse as any);
    mockFactorGetArea.mockResolvedValue(mockAreaResponse as any);

    // Reset Excel mocks
    mockExcelRun.mockClear();
    mockExcelRun.mockImplementation((callback) => callback(mockContext));
    
    mockAreaDataSheet.getRange.mockClear();
    mockAreaDataSheet.getRange.mockImplementation((address) => {
      if (address === "A1:E1") return mockHeaderRange;
      return mockDataRange;
    });

    // Reset data range values
    mockDataRange.values = [];

    // Mock getRangeByIndexes to return different ranges based on parameters
    mockAreaDataSheet.getRangeByIndexes.mockClear();
    mockAreaDataSheet.getRangeByIndexes.mockImplementation((startRow, startCol, rowCount, colCount) => {
      // If it's the header row only (rowCount === 1), return a separate header range
      if (rowCount === 1) {
        return {
          format: {
            font: {
              bold: true,
              color: "white",
            },
            fill: {
              color: "#4472C4",
            },
          },
        };
      }
      // Otherwise, return the main data range that captures all data
      return mockDataRange;
    });

    mockAreaDataSheet.getUsedRange.mockClear();
    mockAreaDataSheet.getUsedRange.mockReturnValue({
      format: {
        autofitColumns: jest.fn(),
      },
    });
  });

  describe("constants", () => {
    it("should export correct sheet name", () => {
      expect(AREA_DATA_SHEET_NAME).toBe("API_Area_Data");
    });

    it("should export correct column mapping", () => {
      expect(AREA_COLUMN_MAP).toEqual({
        apiName: 0,
        alpha3: 1,
        countryName: 2,
        stateProvince: 3,
        powerGrid: 4,
      });
    });
  });

  describe("loadAndPopulateAreaData", () => {
    it("should create hidden sheet with correct name", async () => {
      await loadAndPopulateAreaData();

      expect(mockContext.workbook.worksheets.add).toHaveBeenCalledWith(AREA_DATA_SHEET_NAME);
      expect(mockAreaDataSheet.visibility).toBe("hidden");
    });

    it("should set up header row", async () => {
      await loadAndPopulateAreaData();

      // Header is included in the data written via getRangeByIndexes
      expect(mockDataRange.values[0]).toEqual([
        "API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"
      ]);
    });

    it("should fetch area data from all APIs", async () => {
      await loadAndPopulateAreaData();

      expect(mockLocationGetArea).toHaveBeenCalled();
      expect(mockMobileGetArea).toHaveBeenCalled();
      expect(mockFugitiveGetArea).toHaveBeenCalled();
      expect(mockStationaryGetArea).toHaveBeenCalled();
      expect(mockCalculationGetArea).toHaveBeenCalled();
      expect(mockTransportationGetArea).toHaveBeenCalled();
      expect(mockFactorGetArea).not.toHaveBeenCalled();
    });

    it("should populate data for all APIs", async () => {
      await loadAndPopulateAreaData();

      // Should have 1 header + 12 data rows (6 APIs × 2 countries, factor/factorsearch not stored)
      expect(mockDataRange.values).toHaveLength(13);

      // Check header row
      expect(mockDataRange.values[0]).toEqual([
        "API Name", "Alpha3", "Country Name", "State/Province", "Power Grid"
      ]);

      // Check first few data rows for location API
      expect(mockDataRange.values[1]).toEqual([
        "location",
        "USA",
        "United States",
        "California, Texas, New York",
        "WECC, ERCOT, NPCC",
      ]);

      expect(mockDataRange.values[2]).toEqual([
        "location",
        "CAN",
        "Canada",
        "Ontario, Quebec, British Columbia",
        "",
      ]);
    });

    it("should NOT store factor and factorsearch data in sheet", async () => {
      await loadAndPopulateAreaData();

      // Factor and factorsearch should NOT be in the sheet (skip header row)
      const factorRows = mockDataRange.values.slice(1).filter(row => row[0] === "factor");
      const factorsearchRows = mockDataRange.values.slice(1).filter(row => row[0] === "factorsearch");
      
      expect(factorRows).toHaveLength(0);
      expect(factorsearchRows).toHaveLength(0);

      // Factor API should NOT be called
      expect(mockFactorGetArea).not.toHaveBeenCalled();
    });

    it("should handle empty power grids array", async () => {
      await loadAndPopulateAreaData();

      // Canada row should have empty power grids (skip header row)
      const canadaRow = mockDataRange.values.slice(1).find(row => row[1] === "CAN");
      expect(canadaRow[4]).toBe(""); // Empty power grids
    });

    it("should handle API with no locations", async () => {
      const emptyResponse = { locations: [] };
      mockLocationGetArea.mockResolvedValueOnce(emptyResponse as any);

      await loadAndPopulateAreaData();

      // Should still have header + data from other APIs
      expect(mockDataRange.values.length).toBeGreaterThan(1);
      
      // But no location API data (skip header row)
      const locationRows = mockDataRange.values.slice(1).filter(row => row[0] === "location");
      expect(locationRows).toHaveLength(0);
    });

    it("should handle API call failure", async () => {
      mockLocationGetArea.mockRejectedValueOnce(new Error("API error"));

      // Should not throw - just logs error and continues with other APIs
      await loadAndPopulateAreaData();

      // Should still have data from other APIs (5 APIs × 2 countries = 10 rows + header)
      expect(mockDataRange.values.length).toBeGreaterThan(1);
      
      // But no location API data
      const locationRows = mockDataRange.values.slice(1).filter(row => row[0] === "location");
      expect(locationRows).toHaveLength(0);
    });

    it("should handle invalid JSON response", async () => {
      mockLocationGetArea.mockResolvedValueOnce("invalid json" as any);

      // Should not throw - just logs error and continues with other APIs
      await loadAndPopulateAreaData();

      // Should still have data from other APIs
      expect(mockDataRange.values.length).toBeGreaterThan(1);
      
      // But no location API data
      const locationRows = mockDataRange.values.slice(1).filter(row => row[0] === "location");
      expect(locationRows).toHaveLength(0);
    });

    it("should handle invalid response format", async () => {
      const invalidResponse = { locations: null };
      mockLocationGetArea.mockResolvedValueOnce(invalidResponse as any);

      // Should not throw - just logs error and continues with other APIs
      await loadAndPopulateAreaData();

      // Should still have data from other APIs
      expect(mockDataRange.values.length).toBeGreaterThan(1);
      
      // But no location API data
      const locationRows = mockDataRange.values.slice(1).filter(row => row[0] === "location");
      expect(locationRows).toHaveLength(0);
    });

    it("should handle Excel.run failure", async () => {
      mockExcelRun.mockRejectedValueOnce(new Error("Excel error"));

      await expect(loadAndPopulateAreaData()).rejects.toThrow();

      try {
        await loadAndPopulateAreaData();
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
        expect(error.message).toContain("Failed to load area data");
      }
    });

    it("should handle missing location properties gracefully", async () => {
      const partialResponse = {
        locations: [
          {
            alpha3: "USA",
            countryName: "United States",
            // Missing stateProvinces and powerGrids
          },
          {
            alpha3: "CAN",
            // Missing countryName, stateProvinces, and powerGrids
          },
        ],
      };
      mockLocationGetArea.mockResolvedValueOnce(partialResponse as any);

      await loadAndPopulateAreaData();

      // Should still create rows with empty values for missing properties (skip header row)
      const locationRows = mockDataRange.values.slice(1).filter(row => row[0] === "location");
      expect(locationRows).toHaveLength(2);

      // USA row with missing arrays
      expect(locationRows[0]).toEqual([
        "location",
        "USA",
        "United States",
        "",
        "",
      ]);

      // CAN row with missing country name
      expect(locationRows[1]).toEqual([
        "location",
        "CAN",
        "",
        "",
        "",
      ]);
    });

    it("should sync Excel context", async () => {
      await loadAndPopulateAreaData();

      expect(mockContext.sync).toHaveBeenCalled();
    });

    it("should set data range with correct address", async () => {
      await loadAndPopulateAreaData();

      // Should call getRangeByIndexes with correct parameters (1 header + 12 data rows = 13 total)
      expect(mockAreaDataSheet.getRangeByIndexes).toHaveBeenCalledWith(0, 0, 13, 5);
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully without throwing", async () => {
      // API errors are caught and logged, but don't stop the function
      const genericError = new Error("Generic error");
      mockLocationGetArea.mockRejectedValueOnce(genericError);

      // Should not throw
      await loadAndPopulateAreaData();

      // Should still have data from other APIs
      expect(mockDataRange.values.length).toBeGreaterThan(1);
    });

    it("should handle Excel.run errors", async () => {
      mockExcelRun.mockRejectedValueOnce(new Error("Excel error"));

      // Excel errors should propagate
      await expect(loadAndPopulateAreaData()).rejects.toThrow("Excel error");
    });
  });

  describe("integration", () => {
    it("should work with realistic area data", async () => {
      const realisticResponse = {
        locations: [
          {
            alpha3: "USA",
            countryName: "United States",
            stateProvinces: ["California", "Texas", "New York", "Florida"],
            powerGrids: ["WECC", "ERCOT", "NPCC", "SERC"],
          },
          {
            alpha3: "GBR",
            countryName: "United Kingdom",
            stateProvinces: ["England", "Scotland", "Wales", "Northern Ireland"],
            powerGrids: ["National Grid"],
          },
        ],
      };

      mockLocationGetArea.mockResolvedValue(realisticResponse as any);
      mockMobileGetArea.mockResolvedValue(realisticResponse as any);
      mockFugitiveGetArea.mockResolvedValue(realisticResponse as any);
      mockStationaryGetArea.mockResolvedValue(realisticResponse as any);
      mockCalculationGetArea.mockResolvedValue(realisticResponse as any);
      mockTransportationGetArea.mockResolvedValue(realisticResponse as any);
      mockFactorGetArea.mockResolvedValue(realisticResponse as any);

      await loadAndPopulateAreaData();

      // Should have 1 header + 12 data rows (6 APIs × 2 countries, factor/factorsearch not stored)
      expect(mockDataRange.values).toHaveLength(13);

      // Check USA data (skip header row)
      const usaLocationRow = mockDataRange.values.slice(1).find(
        row => row[0] === "location" && row[1] === "USA"
      );
      expect(usaLocationRow).toEqual([
        "location",
        "USA",
        "United States",
        "California, Texas, New York, Florida",
        "WECC, ERCOT, NPCC, SERC",
      ]);

      // Check GBR data (skip header row)
      const gbrLocationRow = mockDataRange.values.slice(1).find(
        row => row[0] === "location" && row[1] === "GBR"
      );
      expect(gbrLocationRow).toEqual([
        "location",
        "GBR",
        "United Kingdom",
        "England, Scotland, Wales, Northern Ireland",
        "National Grid",
      ]);
    });
  });
});

// Made with Bob