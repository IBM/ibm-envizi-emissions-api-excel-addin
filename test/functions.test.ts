import * as funcs from '../src/functions_component/functions';
import { Client, LocationApi, StationaryApi } from './mocks/ibm-ghg-sdk';
import { storage } from './mocks/OfficeRuntime';

describe("genericApiCall", () => {
  it("should return error if apiKey or clientId missing", async () => {
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce(null);
    const res = await funcs.genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "CA",
      powerGrid: "GridX",
      type: "electricity",
      value: 100,
      unit: "kWh"
    });
    expect(res[0]).toBe("Error");
    expect(res[1]).toMatch(/Missing apiKey/);
  });

  it("should call correct API and return result", async () => {
    const res = await funcs.genericApiCall("stationary", {
      date: "44562",
      country: "USA",
      stateProvince: "CA",
      type: "electricity",
      value: 100,
      unit: "kWh"
    });
    expect(StationaryApi.calculate).toHaveBeenCalled();
    expect(res[0]).toBe("456");
  });
});

describe("v3_location_helper", () => {
  it("should call genericApiCall with 'location'", async () => {
    const spy = jest.spyOn(funcs, "genericApiCall").mockResolvedValue(["123"]);
    const result = await funcs.v3_location_helper("44562", "USA", "CA", "GridX", "electricity", 100, "kWh");
    expect(spy).toHaveBeenCalledWith("location", expect.objectContaining({ type: "electricity" }));
    expect(result).toEqual(["123"]);
  });
});

describe("v3_location wrapper", () => {
  it("should validate input length and return error", async () => {
    const result = await funcs.v3_location([["only", "4", "fields", "here"]]);
    expect(result[0][0]).toBe("Error");
  });

  it("should process full input correctly", async () => {
    const result = await funcs.v3_location([["44562", "USA", "CA", "GridX", "electricity", 100, "kWh"]]);
    expect(result[0][0]).toBe("123");
  });
});
