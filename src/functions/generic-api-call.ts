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

export async function genericApiCall(
  apiType:
    | "location"
    | "stationary"
    | "fugitive"
    | "mobile"
    | "calculation"
    | "transportation_and_distribution",
  payload: {
    value: number;
    unit: string;
    country: string;
    stateProvince: string;
    date: string;
    powerGrid?: string;
    type?: string;
    factorId?: number;
  },
  invocation?: CustomFunctions.Invocation
): Promise<any[][]> {
  try {
    const address = invocation?.address ?? null;
    await ensureClient();

    const location: any = {};

      if(payload.country) location.country= payload.country;
      if(payload.stateProvince) location.stateProvince= payload.stateProvince;
    
    if (apiType === "location" || apiType === "calculation") {
      if (payload.powerGrid) {
        location.powerGrid = payload.powerGrid;
      }
    }

    const apiParams: any = {
      activity: {
        value: payload.value,
        unit: payload.unit,
        ...(payload.type ? { type: payload.type } : {}),
        ...(payload.factorId ? { factorId: payload.factorId } : {}),
      },
      includeDetails: false,
      ...(Object.keys(location).length > 0 ? { location } : {}),
    };

    const formattedDate = payload.date?.trim() ? convertExcelDateToISO(payload.date) : null;
    if (formattedDate) {
      apiParams.time = { date: formattedDate };
    }

    let response: any;

    switch (apiType) {
      case "location":
        response = await LocationEmission.calculate(apiParams);
        break;
      case "stationary":
        response = await StationaryEmission.calculate(apiParams);
        break;
      case "fugitive":
        response = await FugitiveEmission.calculate(apiParams);
        break;
      case "mobile":
        response = await MobileEmission.calculate(apiParams);
        break;
      case "calculation":
        response = await GenericCalculationEmission.calculate(apiParams);
        break;
      case "transportation_and_distribution":
        response = await TransportationDistributionEmission.calculate(apiParams);
        break;
      default:
        throw new CustomFunctions.Error(
          CustomFunctions.ErrorCode.notAvailable,
          `Unsupported API type: ${apiType}`
        );
    }

    if (!response || typeof response !== "object") {
      const message = "Invalid API response";
      console.error(`${apiType} API request failed: `, message);
      throw new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable, message);
    }

    const rowData: (string | number | null)[] = [
      response.totalCO2e,
      response.CO2,
      response.CH4,
      response.N2O,
      response.HFC,
      response.PFC,
      response.SF6,
      response.NF3,
      response.bioCO2,
      response.indirectCO2e,
      response.unit,
      response.description,
      response.transactionId,
    ];
    const excelResponse = [rowData];
    if (OfficeRuntime?.storage) {
      const storagePayload = { address, values: excelResponse };
      OfficeRuntime.storage
        .setItem(`freezeData-${address}`, JSON.stringify(storagePayload))
        .catch((err) => {
          console.error("[CustomFunction] Failed to store freezeData:", err);
        });
    }

    return excelResponse;
  } catch (e) {
    if (e instanceof CustomFunctions.Error) {
      throw e;
    }
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
