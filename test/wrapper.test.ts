import {
  v3_stationary,
  v3_location,
  v3_fugitive,
  v3_mobile,
  v3_calculation,
} from '../src/functions_component/wrapperFunctions';
import * as helpers from '../src/functions_component/helperFunctions';

jest.mock('../src/functions_component/helperFunctions');

const mockStationary = helpers.v3_stationary_helper as jest.MockedFunction<typeof helpers.v3_stationary_helper>;
const mockLocation = helpers.v3_location_helper as jest.MockedFunction<typeof helpers.v3_location_helper>;
const mockFugitive = helpers.v3_fugitive_helper as jest.MockedFunction<typeof helpers.v3_fugitive_helper>;
const mockMobile = helpers.v3_mobile_helper as jest.MockedFunction<typeof helpers.v3_mobile_helper>;
const mockCalculation = helpers.v3_calculation_helper as jest.MockedFunction<typeof helpers.v3_calculation_helper>;

describe('Wrapper Function Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // v3_stationary
  describe('v3_stationary', () => {
    it('should call helper with correct params', async () => {
      const input = [['2024-01-01', 'USA', 'CA', 'diesel', 50, 'L']];
      mockStationary.mockResolvedValueOnce(['stationary result']);
      const result = await v3_stationary(input);

      expect(mockStationary).toHaveBeenCalledWith('2024-01-01', 'USA', 'CA', 'diesel', 50, 'L');
      expect(result).toEqual([['stationary result']]);
    });

    it('should return error on missing input', async () => {
      const result = await v3_stationary([['2024-01-01']]);
      expect(result).toEqual([['Error', 'Expected 6 fields: date, country, stateProvince, type, value, unit']]);
    });
  });

  // v3_location
  describe('v3_location', () => {
    it('should call helper with correct params', async () => {
      const input = [['2024-01-01', 'USA', 'NY', '', 'solar', 100, 'kWh']];
      mockLocation.mockResolvedValueOnce(['location result']);
      const result = await v3_location(input);

      expect(mockLocation).toHaveBeenCalledWith('2024-01-01', 'USA', 'NY', 'solar', '', 100, 'kWh');
      expect(result).toEqual([['location result']]);
    });

    it('should return error on missing input', async () => {
      const result = await v3_location([['2024-01-01', 'USA']]);
      expect(result).toEqual([['Error', 'Expected 7 fields: date, country, stateProvince, powerGrid, type, value, unit']]);
    });
  });

  // v3_fugitive
  describe('v3_fugitive', () => {
    it('should call helper with correct params', async () => {
      const input = [['2024-01-01', 'USA', 'TX', 'R134a', 10, 'kg']];
      mockFugitive.mockResolvedValueOnce(['fugitive result']);
      const result = await v3_fugitive(input);

      expect(mockFugitive).toHaveBeenCalledWith('2024-01-01', 'USA', 'TX', 'R134a', 10, 'kg');
      expect(result).toEqual([['fugitive result']]);
    });

    it('should return error on missing input', async () => {
      const result = await v3_fugitive([['2024-01-01']]);
      expect(result).toEqual([['Error', 'Expected 6 fields: date, country, stateProvince, type, value, unit']]);
    });
  });

  // v3_mobile
  describe('v3_mobile', () => {
    it('should call helper with correct params', async () => {
      const input = [['2024-01-01', 'USA', 'CA', 'gasoline', 500, 'L']];
      mockMobile.mockResolvedValueOnce(['mobile result']);
      const result = await v3_mobile(input);

      expect(mockMobile).toHaveBeenCalledWith('2024-01-01', 'USA', 'CA', 'gasoline', 500, 'L');
      expect(result).toEqual([['mobile result']]);
    });

    it('should return error on missing input', async () => {
      const result = await v3_mobile([['2024-01-01', 'USA']]);
      expect(result).toEqual([['Error', 'Expected 6 fields: date, country, stateProvince, type, value, unit']]);
    });
  });

  // v3_calculation
  describe('v3_calculation', () => {
    it('should call helper with correct params', async () => {
      const input = [['2024-01-01', 'USA', 'CA', '', 'typeA', 20, 'kWh']];
      mockCalculation.mockResolvedValueOnce(['calculation result']);
      const result = await v3_calculation(input);

      expect(mockCalculation).toHaveBeenCalledWith('2024-01-01', 'USA', 'CA', '', 'typeA', 20, 'kWh');
      expect(result).toEqual([['calculation result']]);
    });

    it('should return error on missing input', async () => {
      const result = await v3_calculation([['2024-01-01']]);
      expect(result).toEqual([['Error', 'Expected 6 fields: date, country, stateProvince, powerGrid, type, value, unit']]);
    });
  });
});
