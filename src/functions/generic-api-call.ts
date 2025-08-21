// Copyright IBM Corp. 2025

import {
  LocationEmission,
  MobileEmission,
  FugitiveEmission,
  StationaryEmission,
  GenericCalculationEmission,
} from "ibm-ghg-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

export async function genericApiCall(
  apiType: "location" | "stationary" | "fugitive" | "mobile" | "calculation",
  payload: {
    type: string;
    value: number;
    unit: string;
    country: string;
    stateProvince: string;
    date: string;
    powerGrid?: string;
  }
): Promise<any[][]> {
  try {
    await ensureClient();

    const location: any = {
      country: payload.country,
      stateProvince: payload.stateProvince,
    };
    if (apiType === "location" || apiType === "calculation") {
      if (payload.powerGrid) {
        location.powerGrid = payload.powerGrid;
      }
    }

    const apiParams: any = {
      activity: { type: payload.type, value: payload.value, unit: payload.unit },
      location,
      includeDetails: false,
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

    return [
      [
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
      ],
    ];
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
