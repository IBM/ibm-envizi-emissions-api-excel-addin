// Copyright IBM Corp. 2025

import {
  validateApiName,
  storeValidationRequest,
  handleTypesFunction,
} from "../src/functions/types-handler";

// Mock Office
const mockSettings = {
  set: jest.fn(),
  saveAsync: jest.fn((callback) => {
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
  AsyncResultStatus: {
    Succeeded: "succeeded",
    Failed: "failed",
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

describe("types-handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateApiName", () => {
    it("should validate and normalize valid API names", () => {
      expect(validateApiName("Location")).toBe("location");
      expect(validateApiName("MOBILE")).toBe("mobile");
      expect(validateApiName("  fugitive  ")).toBe("fugitive");
      expect(validateApiName("Stationary")).toBe("stationary");
      expect(validateApiName("CALCULATION")).toBe("calculation");
      expect(validateApiName("TransportationAndDistribution")).toBe("transportationanddistribution");
      expect(validateApiName("Factor")).toBe("factor");
    });

    it("should throw error for invalid API names", () => {
      expect(() => validateApiName("invalid")).toThrow();
      expect(() => validateApiName("")).toThrow();
      expect(() => validateApiName("unknown")).toThrow();
    });

    it("should throw error with correct error code", () => {
      try {
        validateApiName("invalid");
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).code).toBe("InvalidValue");
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should include valid options in error message", () => {
      try {
        validateApiName("invalid");
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("location");
        expect(error.message).toContain("mobile");
        expect(error.message).toContain("fugitive");
        expect(error.message).toContain("stationary");
        expect(error.message).toContain("calculation");
        expect(error.message).toContain("transportationanddistribution");
        expect(error.message).toContain("factor");
      }
    });
  });

  describe("storeValidationRequest", () => {
    it("should store validation request in Office settings", () => {
      const cellAddress = "Sheet1!A1";
      const apiName = "location";

      storeValidationRequest(cellAddress, apiName);

      expect(mockSettings.set).toHaveBeenCalledWith("validationRequest", {
        cellAddress,
        apiName,
        timestamp: expect.any(Number),
      });
      expect(mockSettings.saveAsync).toHaveBeenCalled();
    });

    it("should call saveAsync with callback", () => {
      storeValidationRequest("Sheet1!A1", "mobile");

      expect(mockSettings.saveAsync).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should handle different cell addresses", () => {
      storeValidationRequest("Sheet2!B5", "fugitive");

      expect(mockSettings.set).toHaveBeenCalledWith(
        "validationRequest",
        expect.objectContaining({
          cellAddress: "Sheet2!B5",
          apiName: "fugitive",
        })
      );
    });

    it("should include timestamp in stored request", () => {
      const beforeTime = Date.now();
      storeValidationRequest("Sheet1!A1", "stationary");
      const afterTime = Date.now();

      const callArgs = mockSettings.set.mock.calls[0][1];
      expect(callArgs.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(callArgs.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("handleTypesFunction", () => {
    const mockInvocation = {
      address: "Sheet1!A1",
    } as CustomFunctions.Invocation;

    it("should handle valid API name successfully", async () => {
      const result = await handleTypesFunction("Location", mockInvocation);

      expect(result).toBe("");
      expect(mockSettings.set).toHaveBeenCalledWith(
        "validationRequest",
        expect.objectContaining({
          cellAddress: "Sheet1!A1",
          apiName: "location",
        })
      );
    });

    it("should normalize API name before storing", async () => {
      await handleTypesFunction("MOBILE", mockInvocation);

      expect(mockSettings.set).toHaveBeenCalledWith(
        "validationRequest",
        expect.objectContaining({
          apiName: "mobile",
        })
      );
    });

    it("should throw error for invalid API name", async () => {
      await expect(handleTypesFunction("invalid", mockInvocation)).rejects.toThrow();

      try {
        await handleTypesFunction("invalid", mockInvocation);
      } catch (error) {
        // Error gets wrapped, so check the message contains the validation error
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should use cell address from invocation", async () => {
      const customInvocation = {
        address: "Sheet2!C10",
      } as CustomFunctions.Invocation;

      await handleTypesFunction("calculation", customInvocation);

      expect(mockSettings.set).toHaveBeenCalledWith(
        "validationRequest",
        expect.objectContaining({
          cellAddress: "Sheet2!C10",
        })
      );
    });

    it("should return empty string", async () => {
      const result = await handleTypesFunction("TransportationAndDistribution", mockInvocation);

      expect(result).toBe("");
    });

    it("should handle factor API name", async () => {
      const result = await handleTypesFunction("factor", mockInvocation);

      expect(result).toBe("");
      expect(mockSettings.set).toHaveBeenCalledWith(
        "validationRequest",
        expect.objectContaining({
          apiName: "factor",
        })
      );
    });

    it("should wrap non-CustomFunctions errors", async () => {
      // Mock settings.set to throw a generic error
      mockSettings.set.mockImplementationOnce(() => {
        throw new Error("Generic error");
      });

      try {
        await handleTypesFunction("location", mockInvocation);
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as any).code).toBe("NotAvailable");
        expect(error.message).toContain("Failed to set up validation");
        expect(error.message).toContain("Generic error");
      }
    });

    it("should handle validation errors", async () => {
      // This tests the error from validateApiName
      try {
        await handleTypesFunction("invalid", mockInvocation);
        fail("Should have thrown an error");
      } catch (error) {
        // Error message should contain validation information
        expect(error.message).toContain("Invalid API name");
      }
    });

    it("should handle errors without message property", async () => {
      mockSettings.set.mockImplementationOnce(() => {
        throw { someProperty: "value" };
      });

      try {
        await handleTypesFunction("location", mockInvocation);
        fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).toContain("Unknown error");
      }
    });
  });
});

// Made with Bob
