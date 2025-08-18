import {
  Client,
  LocationEmission,
  MobileEmission,
  FugitiveEmission,
  StationaryEmission,
  GenericCalculationEmission,
} from "ibm-ghg-sdk";
import { convertExcelDateToISO } from "./utils";

export async function genericApiCall(
  apiType: "location" | "stationary" | "fugitive" | "mobile" | "calculation",
  payload: {
    date: string;
    country: string;
    stateProvince: string;
    powerGrid?: string;
    type: string;
    value: number;
    unit: string;
  },
  invocation?: CustomFunctions.Invocation
): Promise<string[][]> {
  try {
    const address = invocation?.address ?? null;
    const formattedDate =
      payload.date && payload.date.trim() !== ""
        ? convertExcelDateToISO(payload.date)
        : null;

    if (!OfficeRuntime?.storage) {

        return [["OfficeRuntime.storage not availaible"]]

    }

    const apiKey = await OfficeRuntime.storage.getItem("apiKey");
    const clientId = await OfficeRuntime.storage.getItem("clientId");

    if (!apiKey || !clientId) {

        return [[`Missing apiKey/clientId: apiKey=${!!apiKey}, clientId=${!!clientId}`]]

    }

    await Client.getClient({
      apiKey,
      clientId,
    });

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
      location,
      activity: { type: payload.type, value: payload.value, unit: payload.unit },
      includeDetails: false,
    }
    
    if (formattedDate) {
      apiParams.time = { date: formattedDate };
    }

    let response: any;
    try {
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
          return [["Error", `Unsupported API type: ${apiType}`]];
      }
    } catch (apiError: any) {
      const errMsg =
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Unknown API request error";


      console.error(`[genericApiCall p] API request failed:`, errMsg);
      return [[errMsg]]
    }

    if (!response || typeof response !== "object") {
      const msg = "Invalid API response";
      console.error(`[genericApiCall] ${msg}`, { response });
      return [["Error", msg]];
    }

    const rowData = Object.entries(response);

    try {
      const storagePayload = {
        address: invocation?.address ?? null,
        values: rowData,
      };
      await OfficeRuntime.storage.setItem(`freezeData-${address}`, JSON.stringify(storagePayload));
    } catch (err) {
      console.error("[CustomFunction] Failed to store freezeData:", err);
    }

    return  [Object.entries(response).map(([k, v]) => `${v}`)];
  } catch (e: any) {
    return ["Error", e?.message || String(e)];
  }
}

