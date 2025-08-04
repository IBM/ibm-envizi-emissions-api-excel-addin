import { genericApiCall } from "../src/functions_component/functions";
import * as utils from "../src/functions_component/utils";
import { createMockOfficeRuntime } from "./__mocks__/officeRuntimeMock";

import { Client, LocationApi, StationaryApi, MobileApi, FugitiveApi, GenericCalculation } from "ibm-ghg-sdk";

jest.mock("ibm-ghg-sdk");
jest.mock("../src/functions_component/utils");

describe("genericApiCall", () => {
  beforeEach(() => {
    (utils.convertExcelDateToISO as jest.Mock).mockReturnValue("2025-01-01");


    global.OfficeRuntime = createMockOfficeRuntime() as any;


    (Client.getClient as jest.Mock).mockResolvedValue(undefined);
    (LocationApi.calculate as jest.Mock).mockResolvedValue({ CO2e: 123 });
    (StationaryApi.calculate as jest.Mock).mockResolvedValue({ CO2e: 456 });
    (MobileApi.calculate as jest.Mock).mockResolvedValue({ CO2e: 789 });
    (FugitiveApi.calculate as jest.Mock).mockResolvedValue({ CO2e: 111 });
    (GenericCalculation.calculate as jest.Mock).mockResolvedValue({ CO2e: 222 });
  });

  afterEach(() => jest.clearAllMocks());

  it("returns error if OfficeRuntime.storage is missing", async () => {
  global.OfficeRuntime = {} as any; 

  const result = await genericApiCall("location", {} as any);

  expect(result[0]).toBe("Error");

  
  expect(result[1]).toContain("OfficeRuntime.storage");
});


  it("returns error if apiKey or clientId is missing", async () => {
    global.OfficeRuntime = createMockOfficeRuntime(null, null) as any;
    const result = await genericApiCall("location", {} as any);
    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Missing apiKey/clientId");
  });

  it("calls LocationApi for 'location'", async () => {
    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh"
    });
    expect(LocationApi.calculate).toHaveBeenCalled();
    expect(result).toEqual(["123"]);
  });

  it("handles unsupported API type", async () => {
    const result = await genericApiCall("unknown" as any, {} as any);
    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Unsupported API type");
  });

  it("returns error on exception", async () => {
    (LocationApi.calculate as jest.Mock).mockRejectedValue(new Error("Some API failure"));
    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh"
    });
    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Some API failure");
  });
});
