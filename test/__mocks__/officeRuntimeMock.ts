// test/__mocks__/officeRuntimeMock.ts
import { OfficeMockObject } from "office-addin-mock";

export function createMockOfficeRuntime(apiKey = "test-api-key", clientId = "test-client-id") {
  const seed = {
    storage: {
      getItem: async (key: string) => {
        if (key === "apiKey") return apiKey;
        if (key === "clientId") return clientId;
        return null;
      },
    },
  };

  return new OfficeMockObject(seed);
}
