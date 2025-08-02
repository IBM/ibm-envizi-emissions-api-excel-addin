export const Client = {
  getClient: jest.fn().mockResolvedValue(true),
};

export const LocationApi = {
  calculate: jest.fn().mockResolvedValue({ co2e: 123 }),
};
export const StationaryApi = {
  calculate: jest.fn().mockResolvedValue({ co2e: 456 }),
};
export const FugitiveApi = {
  calculate: jest.fn().mockResolvedValue({ co2e: 789 }),
};
export const MobileApi = {
  calculate: jest.fn().mockResolvedValue({ co2e: 111 }),
};
export const GenericCalculation = {
  calculate: jest.fn().mockResolvedValue({ co2e: 999 }),
};
