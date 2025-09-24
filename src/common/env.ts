// Copyright IBM Corp. 2025

export type EnvType = "prod";
export type ApiId = "saascore" | "ghgemissions";

export const apiUrls: Record<ApiId, Record<EnvType, string>> = {
  saascore: {
    prod: "https://api.ibm.com/saascore/run",
  },
  ghgemissions: {
    prod: "https://api.ibm.com/ghgemissions/run",
  },
};

let _envType: EnvType;

function detectEnvType(): EnvType {
  // Always return prod environment for external repository
  return "prod";
}

export function getEnvType(): EnvType {
  if (!_envType) {
    _envType = detectEnvType();
  }
  return _envType;
}

export function getApiUrl(api: ApiId) {
  const envType = getEnvType();
  return apiUrls[api][envType];
}
