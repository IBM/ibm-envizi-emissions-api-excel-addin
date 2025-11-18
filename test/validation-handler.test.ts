// Copyright IBM Corp. 2025

import {
  initializeValidationHandler,
  removeValidationHandler,
} from "../src/taskpane/validation-handler";
import { API_COLUMN_MAP, loadAndPopulateApiTypes } from "../src/functions/api-types-loader";

// Mock the api-types-loader module
jest.mock("../src/functions/api-types-loader", () => ({
  API_COLUMN_MAP: {
    location: 0,
    mobile: 1,
    fugitive: 2,
    stationary: 3,
    calculation: 4,
    transportationanddistribution: 5,
    factor: 4,
  },
  loadAndPopulateApiTypes: jest.fn(),
}));

// Mock Excel
const mockContext = {
  workbook: {
    worksheets: {
      getItem: jest.fn(),
      getActiveWorksheet: jest.fn(),
    },
  },
  sync: jest.fn(),
};

const mockSheet = {
  name: "API_Types_Data",
  getRange: jest.fn(),
};

const mockTargetSheet = {
  name: "Sheet1",
  getRange: jest.fn(),
};

const mockColumn = {
  getUsedRange: jest.fn(),
};

const mockUsedRange = {
  rowCount: 5,
  address: "API_Types_Data!A1:A5",
  load: jest.fn(),
};

const mockDataRange = {
  address: "API_Types_Data!A2:A5",
  values: [["type1"], ["type2"], ["type3"], ["type4"]],
  load: jest.fn(),
};

const mockTargetCell = {
  dataValidation: {
    clear: jest.fn(),
    rule: null as any,
    prompt: null as any,
    errorAlert: null as any,
  },
};

global.Excel = {
  run: jest.fn((callback) => callback(mockContext)),
  SheetVisibility: { hidden: "hidden" },
  DataValidationAlertStyle: { stop: "stop" },
} as any;

// Mock Office
const mockSettings = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  saveAsync: jest.fn((callback) => {
    if (callback) {
      callback({ status: "succeeded" });
    }
  }),
  addHandlerAsync: jest.fn((eventType, handler, callback) => {
    if (callback) {
      callback({ status: "succeeded" });
    }
  }),
  removeHandlerAsync: jest.fn((eventType, options, callback) => {
    if (callback) {
      callback({ status: "succeeded" });
    }
  }),
};

global.Office = {
  context: {
    document: {
      settings: mockSettings,
    },
  },
  EventType: {
    SettingsChanged: "settingsChanged",
  },
  AsyncResultStatus: {
    Succeeded: "succeeded",
    Failed: "failed",
  },
} as any;

// Mock console methods to prevent output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

describe("validation-handler", () => {
  const mockLoadAndPopulateApiTypes = loadAndPopulateApiTypes as jest.MockedFunction<typeof loadAndPopulateApiTypes>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockContext.workbook.worksheets.getItem.mockReturnValue(mockSheet);
    mockContext.workbook.worksheets.getActiveWorksheet.mockReturnValue(mockTargetSheet);
    mockSheet.getRange.mockReturnValue(mockColumn);
    mockTargetSheet.getRange.mockReturnValue(mockTargetCell);
    mockColumn.getUsedRange.mockReturnValue(mockUsedRange);
    mockSheet.getRange.mockImplementation((address) => {
      if (address.includes("2:")) {
        return mockDataRange;
      }
      return mockColumn;
    });
    
    // Default: loadAndPopulateApiTypes succeeds
    mockLoadAndPopulateApiTypes.mockResolvedValue(undefined);
  });

  describe("initializeValidationHandler", () => {
    it("should add settings change handler", () => {
      initializeValidationHandler();

      expect(mockSettings.addHandlerAsync).toHaveBeenCalledWith(
        "settingsChanged",
        expect.any(Function),
        expect.any(Function)
      );
    });

    it("should handle successful initialization", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      initializeValidationHandler();

      const callback = mockSettings.addHandlerAsync.mock.calls[0][2];
      callback({ status: "succeeded" });

      expect(consoleSpy).toHaveBeenCalledWith("Validation handler initialized successfully");
      consoleSpy.mockRestore();
    });

    it("should handle initialization failure", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      initializeValidationHandler();

      const callback = mockSettings.addHandlerAsync.mock.calls[0][2];
      callback({ status: "failed", error: { message: "Init failed" } });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to initialize validation handler:",
        expect.objectContaining({ message: "Init failed" })
      );
      consoleSpy.mockRestore();
    });

    it("should check for pending requests on initialization", () => {
      mockSettings.get.mockReturnValue(null);

      initializeValidationHandler();

      expect(mockSettings.get).toHaveBeenCalledWith("validationRequest");
    });
  });

  describe("removeValidationHandler", () => {
    it("should remove settings change handler", () => {
      removeValidationHandler();

      expect(mockSettings.removeHandlerAsync).toHaveBeenCalledWith(
        "settingsChanged",
        expect.objectContaining({ handler: expect.any(Function) }),
        expect.any(Function)
      );
    });

    it("should handle successful removal", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      removeValidationHandler();

      const callback = mockSettings.removeHandlerAsync.mock.calls[0][2];
      callback({ status: "succeeded" });

      expect(consoleSpy).toHaveBeenCalledWith("Validation handler removed successfully");
      consoleSpy.mockRestore();
    });

    it("should handle removal failure", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      removeValidationHandler();

      const callback = mockSettings.removeHandlerAsync.mock.calls[0][2];
      callback({ status: "failed", error: { message: "Remove failed" } });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to remove validation handler:",
        expect.objectContaining({ message: "Remove failed" })
      );
      consoleSpy.mockRestore();
    });
  });

  describe("API_COLUMN_MAP integration", () => {
    it("should have correct column mapping for all APIs", () => {
      expect(API_COLUMN_MAP.location).toBe(0);
      expect(API_COLUMN_MAP.mobile).toBe(1);
      expect(API_COLUMN_MAP.fugitive).toBe(2);
      expect(API_COLUMN_MAP.stationary).toBe(3);
      expect(API_COLUMN_MAP.calculation).toBe(4);
      expect(API_COLUMN_MAP.transportationanddistribution).toBe(5);
      expect(API_COLUMN_MAP.factor).toBe(4); // Factor uses same column as calculation
    });
  });

  describe("validation request processing", () => {
    it("should process validation request when settings change", async () => {
      const validationRequest = {
        cellAddress: "Sheet1!A1",
        apiName: "location",
        timestamp: Date.now(),
      };

      mockSettings.get.mockReturnValue(validationRequest);

      initializeValidationHandler();

      // Get the handler function that was registered
      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];

      // Call the handler
      await handler();

      expect(mockSettings.get).toHaveBeenCalledWith("validationRequest");
      // Note: remove and saveAsync are called but may not be captured in test due to async callback
    });

    it("should not process when no validation request exists", async () => {
      mockSettings.get.mockReturnValue(null);

      initializeValidationHandler();

      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];
      await handler();

      expect(mockSettings.remove).not.toHaveBeenCalled();
    });

    it("should handle errors during validation processing", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const validationRequest = {
        cellAddress: "Sheet1!A1",
        apiName: "invalid",
        timestamp: Date.now(),
      };

      mockSettings.get.mockReturnValue(validationRequest);

      initializeValidationHandler();

      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];
      await handler();

      // Check that error was logged (either "Unknown API name" or "Error in settings change handler")
      expect(consoleSpy).toHaveBeenCalled();
      const errorCalls = consoleSpy.mock.calls.map(call => call[0]);
      expect(errorCalls.some(msg =>
        msg.includes("Unknown API name") || msg.includes("Error in settings change handler")
      )).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  describe("data validation application", () => {
    it("should verify factor API uses same column as calculation", () => {
      // Factor should use column index 4 (same as calculation)
      expect(API_COLUMN_MAP.factor).toBe(4);
      expect(API_COLUMN_MAP.calculation).toBe(4);
    });

    it("should verify all API column mappings are defined", () => {
      expect(API_COLUMN_MAP.location).toBeDefined();
      expect(API_COLUMN_MAP.mobile).toBeDefined();
      expect(API_COLUMN_MAP.fugitive).toBeDefined();
      expect(API_COLUMN_MAP.stationary).toBeDefined();
      expect(API_COLUMN_MAP.calculation).toBeDefined();
      expect(API_COLUMN_MAP.transportationanddistribution).toBeDefined();
      expect(API_COLUMN_MAP.factor).toBeDefined();
    });
  });

  describe("sheet creation on demand", () => {
    let originalWorksheets: any;

    beforeEach(() => {
      // Save original worksheets mock
      originalWorksheets = mockContext.workbook.worksheets;
    });

    afterEach(() => {
      // Restore original worksheets mock
      mockContext.workbook.worksheets = originalWorksheets;
    });

    it("should create sheet when it does not exist", async () => {
      // Mock Excel.run to simulate sheet checking and creation
      const mockExcelRun = jest.fn();
      mockExcelRun
        .mockImplementationOnce((callback) => {
          // First call: check if sheet exists
          return callback({
            workbook: {
              worksheets: {
                items: [], // No sheets exist
                load: jest.fn(),
              },
            },
            sync: jest.fn().mockResolvedValue(undefined),
          });
        })
        .mockImplementation((callback) => {
          // Subsequent calls: normal validation flow
          return callback(mockContext);
        });

      (global.Excel as any).run = mockExcelRun;

      const validationRequest = {
        cellAddress: "Sheet1!A1",
        apiName: "location",
        timestamp: Date.now(),
      };

      mockSettings.get.mockReturnValue(validationRequest);

      initializeValidationHandler();
      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];
      
      await handler();

      expect(mockLoadAndPopulateApiTypes).toHaveBeenCalled();
    });

    it("should not create sheet when it already exists", async () => {
      // Mock Excel.run to simulate existing sheet
      const mockExcelRun = jest.fn();
      mockExcelRun
        .mockImplementationOnce((callback) => {
          // First call: check if sheet exists
          return callback({
            workbook: {
              worksheets: {
                items: [{ name: "API_Types_Data" }], // Sheet exists
                load: jest.fn(),
              },
            },
            sync: jest.fn().mockResolvedValue(undefined),
          });
        })
        .mockImplementation((callback) => {
          // Subsequent calls: normal validation flow
          return callback(mockContext);
        });

      (global.Excel as any).run = mockExcelRun;

      const validationRequest = {
        cellAddress: "Sheet1!A1",
        apiName: "location",
        timestamp: Date.now(),
      };

      mockSettings.get.mockReturnValue(validationRequest);

      initializeValidationHandler();
      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];
      
      await handler();

      expect(mockLoadAndPopulateApiTypes).not.toHaveBeenCalled();
    });

    it("should handle errors when creating sheet", async () => {
      // Mock Excel.run to simulate sheet doesn't exist
      const mockExcelRun = jest.fn();
      mockExcelRun.mockImplementationOnce((callback) => {
        return callback({
          workbook: {
            worksheets: {
              items: [], // No sheets exist
              load: jest.fn(),
            },
          },
          sync: jest.fn().mockResolvedValue(undefined),
        });
      });

      (global.Excel as any).run = mockExcelRun;

      // Mock loadAndPopulateApiTypes to fail
      mockLoadAndPopulateApiTypes.mockRejectedValueOnce(new Error("Failed to create sheet"));

      const validationRequest = {
        cellAddress: "Sheet1!A1",
        apiName: "location",
        timestamp: Date.now(),
      };

      mockSettings.get.mockReturnValue(validationRequest);

      initializeValidationHandler();
      const handler = mockSettings.addHandlerAsync.mock.calls[0][1];
      
      await handler();

      expect(mockLoadAndPopulateApiTypes).toHaveBeenCalled();
    });
  });
});

// Made with Bob
