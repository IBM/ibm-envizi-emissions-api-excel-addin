// Copyright IBM Corp. 2025

import { factorSearch } from "../src/functions/factorSearchHelper";
import { Factor } from "emissions-api-sdk";
import { ensureClient } from "../src/functions/client";


jest.mock("emissions-api-sdk", () => ({
  Factor: {
    search: jest.fn(),
  },
}));

jest.mock("../src/functions/client", () => ({
  ensureClient: jest.fn(),
}));

jest.mock("../src/functions/utils", () => ({
  convertExcelDateToISO: jest.fn((d) => d), // pass-through
}));

describe("factorSearch", () => {
  const mockedEnsureClient = ensureClient as jest.MockedFunction<typeof ensureClient>;
  const mockedSearch = Factor.search as jest.MockedFunction<typeof Factor.search>;

  // Mock CustomFunctions global for Jest
  beforeAll(() => {
    (global as any).CustomFunctions = {
      ErrorCode: {
        notAvailable: "NotAvailable",
        invalidValue: "InvalidValue",
      },
      Error: class CustomFunctionError extends Error {
        code: string;
        constructor(code: string, message: string) {
          super(message);
          this.code = code;
          this.name = "CustomFunctions.Error";
        }
      },
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedEnsureClient.mockResolvedValue(undefined);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  const mockResponse = {
    factors: [
      {
        factorSet: "set1",
        source: "source1",
        activityType: "type1",
        activityUnit: "kg",
        region: "USA",
      },
      {
        factorSet: "set2",
        source: "source2",
        activityType: "type2",
        activityUnit: "L",
        region: "Canada",
      },
    ],
  };

  it("returns formatted factor search result from object response", async () => {
    mockedSearch.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await factorSearch("diesel", "USA");

    expect(result).toEqual([
      ["set1", "source1", "type1", "kg", "USA",""],
      ["set2", "source2", "type2", "L", "Canada",""],
    ]);
  });

  it("parses and returns formatted result from JSON string response", async () => {
    mockedSearch.mockResolvedValue(JSON.stringify(mockResponse));

    const result = await factorSearch("diesel", "USA");

    expect(result).toEqual([
      ["set1", "source1", "type1", "kg", "USA",""],
      ["set2", "source2", "type2", "L", "Canada",""],
    ]);
  });

  it("throws CustomFunctions.Error with message from error response", async () => {
    const error = {
      response: { data: { message: "Invalid parameters" } },
      status: 400,
    };
    mockedSearch.mockRejectedValue(error);

    await expect(factorSearch("invalid", "??")).rejects.toThrow("Invalid parameters");
  });

  it("throws CustomFunctions.Error with fallback message", async () => {
    const error = new Error("Something went wrong");
    mockedSearch.mockRejectedValue(error);

    await expect(factorSearch("x", "y")).rejects.toThrow("Something went wrong");
  });

  it("returns default values for missing or null fields in factor search response", async () => {
  
  const mockResponseWithNullValues = {
    factors: [
      {
        factorSet: null,        
        source: "source1",      
        activityType: "type1",  
        activityUnit: "kg",     
        region: "USA",          
      },
      {
        factorSet: "set2",      
        source: null,           
        activityType: "type2",  
        activityUnit: "L",      
        region: "Canada",       
      },
    ],
  };

  
  mockedSearch.mockResolvedValue(JSON.stringify(mockResponseWithNullValues));

  const result = await factorSearch("diesel", "USA");

  
  expect(result).toEqual([
    [
      "",             
      "source1",      
      "type1",        
      "kg",           
      "USA",          
      "",             
    ],
    [
      "set2",         
      "",             
      "type2",        
      "L",            
      "Canada",       
      "",             
    ],
  ]);
});

});
