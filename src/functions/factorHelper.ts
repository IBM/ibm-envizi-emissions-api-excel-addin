// Copyright IBM Corp. 2025

import { Factors } from "ibm-ghg-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

export async function factorHelper(
  typeOrId: string | number,
  unit: string,
  country?: string,
  stateProvince?: string,
  date?: string
): Promise<any[][]> {
  await ensureClient();

  let apiParams: any = {
    activity: { unit },
  };

  if (typeof typeOrId === "string") {
    apiParams.activity.type = typeOrId;

    if (country) {
      apiParams.location = { country };
      if (stateProvince) apiParams.location.stateProvince = stateProvince;
    }

    if (date?.trim()) {
      const formattedDate = convertExcelDateToISO(date);
      apiParams.time = { date: formattedDate };
    }

  } else {
    apiParams.activity.factorId = typeOrId;
  }

  const rawResponse = await Factors.retrieveFactor(apiParams);

  const response = typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse;

  if (!response || typeof response === "undefined") {
    throw new CustomFunctions.Error(
      CustomFunctions.ErrorCode.notAvailable,
      "Invalid API response"
    );
  }

  const getValue = (key: keyof typeof response, type: "string" | "gas" = "string") => {
    const value = response[key];
    if (value === undefined || value === null) {
      return type === "gas" ? 0 : ""; 
    }
    return value;
  };

return [
  [
    getValue("factorSet", "string"),
    getValue("source" , "string"),
    getValue("activityType" , "string"),
    getValue("activityUnit" , "string"),
    getValue("name" , "string"),
    getValue("description" , "string"),
    getValue("effectiveFrom" , "string"),
    getValue("effectiveTo" , "string"),
    getValue("publishedFrom" , "string"),
    getValue("publishedTo" , "string"),
    getValue("region" , "string"),
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
    getValue("unit", "string"),
    getValue("factorId" , "string"),
    getValue("transactionId" , "string"),
  ],
];
}
