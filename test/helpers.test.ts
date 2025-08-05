jest.mock('../src/functions_component/genericApiCall', () => ({
  genericApiCall: jest.fn().mockResolvedValue(['mocked result']),
}));

import * as helpers from '../src/functions_component/helperFunctions';
import { genericApiCall } from '../src/functions_component/genericApiCall';

describe('Helper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('v3_stationary_helper calls genericApiCall with correct payload', async () => {
    await helpers.v3_stationary_helper('2024-01-01', 'USA', 'CA', 'diesel', 50, 'L');

    expect(genericApiCall).toHaveBeenCalledWith('stationary', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'diesel',
      value: 50,
      unit: 'L',
    });
  });

  it('v3_location_helper calls genericApiCall with correct payload', async () => {
    await helpers.v3_location_helper('2024-01-01', 'USA', 'NY', 'NYGrid', 'solar', 100, 'kWh');

    expect(genericApiCall).toHaveBeenCalledWith('location', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'NY',
      powerGrid: 'NYGrid',
      type: 'solar',
      value: 100,
      unit: 'kWh',
    });
  });

  it('v3_fugitive_helper calls genericApiCall with correct payload', async () => {
    await helpers.v3_fugitive_helper('2024-01-01', 'USA', 'CA', 'HFC-134a', 20, 'kg');

    expect(genericApiCall).toHaveBeenCalledWith('fugitive', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'HFC-134a',
      value: 20,
      unit: 'kg',
    });
  });

  it('v3_mobile_helper calls genericApiCall with correct payload', async () => {
    await helpers.v3_mobile_helper('2024-01-01', 'USA', 'CA', 'petrol', 300, 'L');

    expect(genericApiCall).toHaveBeenCalledWith('mobile', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'petrol',
      value: 300,
      unit: 'L',
    });
  });

  it('v3_calculation_helper calls genericApiCall with correct payload', async () => {
    await helpers.v3_calculation_helper('2024-01-01', 'USA', 'CA', 'PG1', 'solar', 75, 'kWh');

    expect(genericApiCall).toHaveBeenCalledWith('calculation', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      powerGrid: 'PG1',
      type: 'solar',
      value: 75,
      unit: 'kWh',
    });
  });
});
