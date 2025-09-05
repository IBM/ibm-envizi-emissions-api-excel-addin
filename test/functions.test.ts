import * as api from "../src/functions/functions"
import { genericApiCall } from "../src/functions/generic-api-call";

jest.mock("../src/functions/generic-api-call", () => ({
  genericApiCall: jest.fn(),
}));

describe("emissions custom functions", () => {
  const mockedGenericApiCall = genericApiCall as jest.MockedFunction<typeof genericApiCall>;

  beforeEach(() => {
    mockedGenericApiCall.mockResolvedValue([["mocked-response"]]);
  });

  const commonTests: {
    fn: (...args: any[]) => Promise<any[][]>;
    name: string;
    apiType: Parameters<typeof genericApiCall>[0];
    args: any[];
    expectedPayload: any;
  }[] = [
    {
      fn: api.location,
      name: "location",
      apiType: "location",
      args: ["electricity", 100, "USA", "NY", "2024-01-01", "kWh", "grid1"],
      expectedPayload: {
        type: "electricity",
        value: 100,
        country: "USA",
        stateProvince: "NY",
        date: "2024-01-01",
        unit: "kWh",
        powerGrid: "grid1",
      },
    },
    {
      fn: api.location_by_factorId,
      name: "location_by_factorId",
      apiType: "location",
      args: [123, 200, "kg"],
      expectedPayload: { factorId: 123, value: 200, unit: "kg" },
    },
    {
      fn: api.stationary,
      name: "stationary",
      apiType: "stationary",
      args: ["fuel", 10, "L", "USA", "CA", "2024-01-01"],
      expectedPayload: {
        type: "fuel",
        value: 10,
        unit: "L",
        country: "USA",
        stateProvince: "CA",
        date: "2024-01-01",
      },
    },
    {
      fn: api.stationary_by_factorId,
      name: "stationary_by_factorId",
      apiType: "stationary",
      args: [456, 20, "L"],
      expectedPayload: { factorId: 456, value: 20, unit: "L" },
    },
    {
      fn: api.fugitive,
      name: "fugitive",
      apiType: "fugitive",
      args: ["gas", 50, "kg", "USA", "TX", "2024-01-01"],
      expectedPayload: {
        type: "gas",
        value: 50,
        unit: "kg",
        country: "USA",
        stateProvince: "TX",
        date: "2024-01-01",
      },
    },
    {
      fn: api.fugitive_by_factorId,
      name: "fugitive_by_factorId",
      apiType: "fugitive",
      args: [789, 30, "kg"],
      expectedPayload: { factorId: 789, value: 30, unit: "kg" },
    },
    {
      fn: api.mobile,
      name: "mobile",
      apiType: "mobile",
      args: ["diesel", 70, "L", "USA", "FL", "2024-01-01"],
      expectedPayload: {
        type: "diesel",
        value: 70,
        unit: "L",
        country: "USA",
        stateProvince: "FL",
        date: "2024-01-01",
      },
    },
    {
      fn: api.mobile_by_factorId,
      name: "mobile_by_factorId",
      apiType: "mobile",
      args: [111, 90, "L"],
      expectedPayload: { factorId: 111, value: 90, unit: "L" },
    },
    {
      fn: api.transportation_and_distribution,
      name: "transportation_and_distribution",
      apiType: "transportation_and_distribution",
      args: ["shipping", 5, "ton", "USA", "WA", "2024-01-01"],
      expectedPayload: {
        type: "shipping",
        value: 5,
        unit: "ton",
        country: "USA",
        stateProvince: "WA",
        date: "2024-01-01",
      },
    },
    {
      fn: api.transportation_and_distribution_by_factorId,
      name: "transportation_and_distribution_by_factorId",
      apiType: "transportation_and_distribution",
      args: [222, 15, "ton"],
      expectedPayload: { factorId: 222, value: 15, unit: "ton" },
    },
    {
      fn: api.calculation,
      name: "calculation",
      apiType: "calculation",
      args: ["custom", 999, "kg", "USA", "NJ", "2024-01-01", "gridX"],
      expectedPayload: {
        type: "custom",
        value: 999,
        unit: "kg",
        country: "USA",
        stateProvince: "NJ",
        date: "2024-01-01",
        powerGrid: "gridX",
      },
    },
    {
      fn: api.calculation_by_factorId,
      name: "calculation_by_factorId",
      apiType: "calculation",
      args: [333, 444, "kg"],
      expectedPayload: { factorId: 333, value: 444, unit: "kg" },
    },
  ];

  test.each(commonTests)("$name calls genericApiCall correctly", async ({ fn, apiType, args, expectedPayload }) => {
    const result = await fn(...args);

    expect(mockedGenericApiCall).toHaveBeenCalledWith(apiType, expectedPayload);
    expect(result).toEqual([["mocked-response"]]);
  });

  it("propagates errors from genericApiCall", async () => {
    mockedGenericApiCall.mockRejectedValueOnce(new Error("Boom!"));
    await expect(api.location("electricity", 1, "USA")).rejects.toThrow("Boom!");
  });
});

