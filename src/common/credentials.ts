// Copyright IBM Corp. 2025

const apiCredentialsKey = "apiCredentials";

export interface ApiCredentials {
  apiKey: string;
  tenantId: string;
  orgId: string;
}

declare global {
  interface Window {
    apiCredentials?: ApiCredentials;
  }
}

export function getApiCredentials(): ApiCredentials {
  return window.apiCredentials;
}

export function setApiCredentials(apiCredentials: ApiCredentials): void {
  window.apiCredentials = apiCredentials;
}

export async function loadApiCredentialsFromStorage(): Promise<ApiCredentials | null> {
  if (!OfficeRuntime.storage) {
    return null;
  }
  return OfficeRuntime.storage.getItem(apiCredentialsKey).then((credentialsJSON) => {
    if (credentialsJSON) {
      const apiCredentials = JSON.parse(credentialsJSON);
      setApiCredentials(apiCredentials);
      return apiCredentials;
    }
    return null;
  });
}

export async function saveApiCredentialsToStorage(apiCredentials: ApiCredentials): Promise<void> {
  setApiCredentials(apiCredentials);
  if (!OfficeRuntime.storage) {
    return;
  }
  const credentialsJSON = JSON.stringify(apiCredentials);
  return OfficeRuntime.storage.setItem(apiCredentialsKey, credentialsJSON);
}

export async function removeApiCredentialsFromStorage(): Promise<void> {
  if (!OfficeRuntime.storage) {
    return;
  }
  return OfficeRuntime.storage.removeItem(apiCredentialsKey);
}

