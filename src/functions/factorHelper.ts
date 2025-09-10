// Copyright IBM Corp. 2025

import { Factors } from "ibm-ghg-sdk";

import { ensureClient } from "./client";
import { convertExcelDateToISO } from "./utils";

export async function factorHelper(
  typeOrId: string | number,
  unit: string,
  country?: string,
  stateProvince?: string,
  date?: string,
  factorSet?: string,
  factorVersion?: string
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

    if (factorSet) apiParams.factorSet = factorSet;
    if (factorVersion) apiParams.factorVersion = factorVersion;
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

  const getValue = (key: keyof typeof response) =>
  response[key] !== undefined ? response[key] : "";

return [
  [
    getValue("factorSet"),
    getValue("source"),
    getValue("unit"),
    getValue("name"),
    getValue("description"),
    getValue("effectiveFrom"),
    getValue("effectiveTo"),
    getValue("publishedFrom"),
    getValue("region"),
    getValue("totalCO2e"),
    getValue("CO2"),
    getValue("CH4"),
    getValue("N2O"),
    getValue("HFC"),
    getValue("PFC"),
    getValue("SF6"),
    getValue("NF3"),
    getValue("bioCO2"),
    getValue("indirectCO2e"),
    getValue("transactionId"),
    getValue("activityType"),
    getValue("activityUnit"),
  ],
];
}
