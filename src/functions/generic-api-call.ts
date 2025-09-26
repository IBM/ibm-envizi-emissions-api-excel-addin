// Copyright IBM Corp. 2025

import {
  LocationEmission,
  MobileEmission,
  FugitiveEmission,
  StationaryEmission,
  GenericCalculationEmission,
  TransportationDistributionEmission,
} from "ibm-ghg-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";


type ApiType =
  | "location"
  | "stationary"
  | "fugitive"
  | "mobile"
  | "transportation_and_distribution"
  | "calculation" ;

interface BasePayload {
  value: number;
  unit?: string;
  
}

export interface PayloadWithType extends BasePayload {
  type: string;
  country: string;
  stateProvince?: string;
  date?: string;
  powerGrid?: string;
}

export interface PayloadWithId extends BasePayload {
  factorId: number;
}

type Payload = PayloadWithType | PayloadWithId;


const emissionApiMap: Record<ApiType, (params: any) => Promise<any>> = {
  location: LocationEmission.calculate,
  stationary: StationaryEmission.calculate,
  fugitive: FugitiveEmission.calculate,
  mobile: MobileEmission.calculate,
  transportation_and_distribution: TransportationDistributionEmission.calculate,
  calculation: GenericCalculationEmission.calculate,
  
};

function buildLocation(payload: PayloadWithType, apiType: ApiType): Record<string, string> | undefined {
  const { country, stateProvince, powerGrid } = payload;
  const location: any = { country };

  if (stateProvince) location.stateProvince = stateProvince;
  if ((apiType === "location" || apiType === "calculation") && powerGrid) {
    location.powerGrid = powerGrid;
  }

  return location;
}

function buildApiParams(apiType: ApiType, payload: Payload): any {
  const { value, unit } = payload;
  const activity: any = { value, ...(unit ? { unit } : {}) };

  if ("type" in payload) {
    activity.type = payload.type;
  } else {
    activity.factorId = payload.factorId;
  }

  const apiParams: any = { activity, includeDetails: false };

  if ("type" in payload) {
    const location = buildLocation(payload, apiType);
    if (location) apiParams.location = location;

    const formattedDate = payload.date?.trim() ? convertExcelDateToISO(payload.date) : null;
    if (formattedDate) {
      apiParams.time = { date: formattedDate };
    }
  }

  return apiParams;
}

function formatResponse(response: any): (string | number | null)[][] {

  const getValue = (key: string, type: "string" | "gas" = "string") => {
    const value = response[key];
    if (value === undefined || value === null) {
      
      if (type === "gas") return 0;
  
      return "";
    }
    return value;
  };

  return [[
    getValue("totalCO2e" , "gas"),
    getValue("CO2" , "gas"),
    getValue("CH4" , "gas"),
    getValue("N2O" , "gas"),
    getValue("HFC" , "gas"),
    getValue("PFC" , "gas"),
    getValue("SF6" , "gas"),
    getValue("NF3" , "gas"),
    getValue("bioCO2" , "gas"),
    getValue("indirectCO2e" , "gas"),
    getValue("unit" , "string"),
    getValue("description", "string"),
    getValue("transactionId", "string"),
  ]];
}

export async function genericApiCall(apiType: ApiType, payload: Payload): Promise<any[][]> {
  try {
    await ensureClient();

    const apiFn = emissionApiMap[apiType];
    if (!apiFn) {
      throw new CustomFunctions.Error(
        CustomFunctions.ErrorCode.notAvailable,
        `Unsupported API type: ${apiType}`
      );
    }

    const apiParams = buildApiParams(apiType, payload);
    const response = await apiFn(apiParams);

    if (!response || typeof response !== "object") {
      throw new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable, "Invalid API response");
    }

    return formatResponse(response);
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.response?.data?.message || e?.message || "Unknown error";
    console.error(`${apiType} API request failed: `, message);

    throw new CustomFunctions.Error(
      e?.status === 400
        ? CustomFunctions.ErrorCode.invalidValue
        : CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}
