// Copyright IBM Corp. 2025

import {
  validateApiName,
  VALID_API_NAMES,
  API_TYPES_CONFIGS,
  API_AREA_CONFIGS,
} from "../src/functions/metadata-utils";

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

describe("metadata-utils", () => {
  describe("VALID_API_NAMES", () => {
    it("should export all valid API names", () => {
      expect(VALID_API_NAMES).toEqual([
        "location",
        "mobile",
        "fugitive",
        "stationary",
        "calculation",
        "transportationanddistribution",
        "factor",
      ]);
    });
  });

  describe("API_TYPES_CONFIGS", () => {
    it("should have 6 API configurations", () => {
      expect(API_TYPES_CONFIGS).toHaveLength(6);
    });

    it("should have correct API names", () => {
      const names = API_TYPES_CONFIGS.map((config) => config.name);
      expect(names).toEqual([
        "Location",
        "Mobile",
        "Fugitive",
        "Stationary",
        "Calculation",
        "TransportationAndDistribution",
      ]);
    });

    it("should have getTypes method for each config", () => {
      API_TYPES_CONFIGS.forEach((config) => {
        expect(config.getTypes).toBeDefined();
        expect(typeof config.getTypes).toBe("function");
      });
    });
  });

  describe("API_AREA_CONFIGS", () => {
    it("should have 2 representative API configurations (optimization for area data)", () => {
      expect(API_AREA_CONFIGS).toHaveLength(2);
    });

    it("should have correct representative API names in lowercase", () => {
      const names = API_AREA_CONFIGS.map((config) => config.name);
      expect(names).toEqual([
        "calculation",
        "mobile",
      ]);
    });

    it("should have class property for each config", () => {
      API_AREA_CONFIGS.forEach((config) => {
        expect(config.class).toBeDefined();
        expect(typeof config.class).toBe("object");
      });
    });

    it("should NOT include factor or factorsearch", () => {
      const names = API_AREA_CONFIGS.map((config) => config.name);
      expect(names).not.toContain("factor");
      expect(names).not.toContain("factorsearch");
    });
  });

  describe("validateApiName", () => {
    it("should accept valid API names", () => {
      VALID_API_NAMES.forEach((apiName) => {
        expect(validateApiName(apiName)).toBe(apiName);
      });
    });

    it("should normalize API names to lowercase", () => {
      expect(validateApiName("LOCATION")).toBe("location");
      expect(validateApiName("Mobile")).toBe("mobile");
      expect(validateApiName("FuGiTiVe")).toBe("fugitive");
    });

    it("should trim whitespace", () => {
      expect(validateApiName("  location  ")).toBe("location");
      expect(validateApiName("\tmobile\n")).toBe("mobile");
    });

    it("should throw error for invalid API names", () => {
      expect(() => validateApiName("invalid")).toThrow();
      expect(() => validateApiName("unknown")).toThrow();
      expect(() => validateApiName("")).toThrow();
      
      // Verify it's a CustomFunctions.Error
      try {
        validateApiName("invalid");
        fail("Should have thrown error");
      } catch (error: any) {
        expect(error.code).toBe("InvalidValue");
      }
    });

    it("should include valid options in error message", () => {
      try {
        validateApiName("invalid");
        fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Invalid API name");
        expect(error.message).toContain("location");
        expect(error.message).toContain("mobile");
        expect(error.code).toBe("InvalidValue");
      }
    });
  });
});

// Made with Bob
