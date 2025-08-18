import { genericApiCall } from "../src/functions_component/genericApiCall";
import * as utils from "../src/functions_component/utils";
import { createMockOfficeRuntime } from "./__mocks__/officeRuntimeMock";

import {
  Client,
  LocationEmission,
  StationaryEmission,
  MobileEmission,
  FugitiveEmission,
  GenericCalculationEmission,
} from "ibm-ghg-sdk";

jest.mock("ibm-ghg-sdk");
jest.mock("../src/functions_component/utils");

describe("genericApiCall", () => {
  beforeEach(() => {
    (utils.convertExcelDateToISO as jest.Mock).mockReturnValue("2025-01-01");

    global.OfficeRuntime = createMockOfficeRuntime() as any;

    (Client.getClient as jest.Mock).mockResolvedValue(undefined);
    (LocationEmission.calculate as jest.Mock).mockResolvedValue({ CO2e: 123 });
    (StationaryEmission.calculate as jest.Mock).mockResolvedValue({ CO2e: 456 });
    (MobileEmission.calculate as jest.Mock).mockResolvedValue({ CO2e: 789 });
    (FugitiveEmission.calculate as jest.Mock).mockResolvedValue({ CO2e: 111 });
    (GenericCalculationEmission.calculate as jest.Mock).mockResolvedValue({ CO2e: 222 });
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

  it("calls LocationEmission for 'location'", async () => {
    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh",
    });

    expect(LocationEmission.calculate).toHaveBeenCalled();
    expect(result).toEqual(["CO2e: 123"]);
  });

  it("calls StationaryEmission for 'stationary'", async () => {
    const result = await genericApiCall("stationary", {
      date: "44562",
      country: "USA",
      stateProvince: "CA",
      type: "diesel",
      value: 50,
      unit: "L",
    });

    expect(StationaryEmission.calculate).toHaveBeenCalled();
    expect(result).toEqual(["CO2e: 456"]);
  });

  it("calls MobileEmission for 'mobile'", async () => {
    const result = await genericApiCall("mobile", {
      date: "44562",
      country: "USA",
      stateProvince: "TX",
      type: "gasoline",
      value: 70,
      unit: "L",
    });

    expect(MobileEmission.calculate).toHaveBeenCalled();
    expect(result).toEqual(["CO2e: 789"]);
  });

  it("calls FugitiveEmission for 'fugitive'", async () => {
    const result = await genericApiCall("fugitive", {
      date: "44562",
      country: "USA",
      stateProvince: "FL",
      type: "HFC",
      value: 20,
      unit: "kg",
    });

    expect(FugitiveEmission.calculate).toHaveBeenCalled();
    expect(result).toEqual(["CO2e: 111"]);
  });

  it("calls GenericCalculationEmission for 'calculation'", async () => {
    const result = await genericApiCall("calculation", {
      date: "44562",
      country: "USA",
      stateProvince: "WA",
      powerGrid: "PG1",
      type: "wind",
      value: 150,
      unit: "kWh",
    });

    expect(GenericCalculationEmission.calculate).toHaveBeenCalled();
    expect(result).toEqual(["CO2e: 222"]);
  });

  it("returns error for unsupported API type", async () => {
    const result = await genericApiCall("unknown" as any, {} as any);

    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Unsupported API type");
  });

  it("returns error when API throws exception", async () => {
    (LocationEmission.calculate as jest.Mock).mockRejectedValue(new Error("Some API failure"));

    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh",
    });

    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Some API failure");
  });

  it("returns error if API returns invalid (null) response", async () => {
    (LocationEmission.calculate as jest.Mock).mockResolvedValue(null);

    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh",
    });

    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Invalid API response");
  });

  it("returns error if API returns non-object (string) response", async () => {
    (LocationEmission.calculate as jest.Mock).mockResolvedValue("unexpected" as any);

    const result = await genericApiCall("location", {
      date: "44562",
      country: "USA",
      stateProvince: "NY",
      powerGrid: "NYISO",
      type: "electricity",
      value: 100,
      unit: "kWh",
    });

    expect(result[0]).toBe("Error");
    expect(result[1]).toContain("Invalid API response");
  });
});
