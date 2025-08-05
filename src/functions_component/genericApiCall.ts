 import { Client, LocationApi , MobileApi, FugitiveApi , StationaryApi , GenericCalculation  } from 'ibm-ghg-sdk';
import { convertExcelDateToISO } from './utils';

export async function genericApiCall(
  apiType: 'location' | 'stationary' | 'fugitive' | 'mobile'| 'calculation',
  payload: {
    date: string,
    country: string,
    stateProvince: string,
    powerGrid?: string;
    type: string,
    value: number,
    unit: string
  }
): Promise<string[]> {
  try {
    const formattedDate = convertExcelDateToISO(payload.date);

    if (!OfficeRuntime?.storage) return ["Error", "OfficeRuntime.storage not available"];

    const apiKey = await OfficeRuntime.storage.getItem("apiKey");
    const clientId = await OfficeRuntime.storage.getItem("clientId");

    if (!apiKey || !clientId) {
      return ["Error", `Missing apiKey/clientId: apiKey=${!!apiKey}, clientId=${!!clientId}`];
    }

    await Client.getClient({ apiKey,
       clientId,
       host: "https://foundation-staging.agtech.ibm.com",
      authUrl: "/Auth/GetBearerForClient",
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

    const apiParams = {
      location,
      time: { date: formattedDate },
      activity: { type: payload.type, value: payload.value, unit: payload.unit },
      includeDetails: false,
    };

    let response: any;
    switch (apiType) {
      case 'location': response = await LocationApi.calculate(apiParams, true); break;
      case 'stationary': response = await StationaryApi.calculate(apiParams, true); break;
      case 'fugitive': response = await FugitiveApi.calculate(apiParams, true); break;
      case 'mobile': response = await MobileApi.calculate(apiParams, true); break;
      case 'calculation': response = await GenericCalculation.calculate(apiParams, true); break;
      default: return ["Error", `Unsupported API type: ${apiType}`];
    }

    if (!response || typeof response !== 'object') {
      return ["Error", "Invalid API response"];
    }

    
    return Object.entries(response).map(([k, v]) => `${v}`);
  } catch (e: any) {
    return ["Error", e?.message || String(e)];
  }
}