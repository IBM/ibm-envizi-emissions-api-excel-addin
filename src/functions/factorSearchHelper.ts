// Copyright IBM Corp. 2025

import { Factors } from "ibm-ghg-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

function buildFactorSearchParams(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string
): any {
  const params: any = {
    activity: { search },
    location: { country },
  };

  if (stateProvince) {
    params.location.stateProvince = stateProvince;
  }

  if (date?.trim()) {
    const formattedDate = convertExcelDateToISO(date);
    params.time = { date: formattedDate };
  }

  
    params.pagination = {};
    params.pagination.page = 1;
    params.pagination.size = 30;
  

  return params;
}

function formatFactorSearchResponse(response: any): (string | number | null)[][] {
  return response.factors.map((factor: any) => [
    factor.factorSet,
    factor.source,
    factor.activityType,
    factor.activityUnit,
    factor.region,
    factor.factorId
  ]);
}

export async function factorSearch(
  search: string,
  country: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  try {
    await ensureClient();

    const apiParams = buildFactorSearchParams(search, country, stateProvince, date);

    const rawResponse = await Factors.Search(apiParams);

  const response =
    typeof rawResponse === "string"
      ? JSON.parse(rawResponse)
      : rawResponse;

  if (!response || !Array.isArray(response.factors)) {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      "Invalid API response structure: Missing 'factors' array"
    );
  }

    return formatFactorSearchResponse(response);
  } catch (e: any) {
    if (e instanceof CustomFunctions.Error) throw e;

    const message = e?.response?.data?.message || e?.message || "Unknown error";
    console.error("Factor search API request failed: ", message);

    throw new CustomFunctions.Error(
      e?.status === 400
        ? CustomFunctions.ErrorCode.invalidValue
        : CustomFunctions.ErrorCode.notAvailable,
      message
    );
  }
}
