import * as functions from '../src/functions_component/functions';

describe('Helper Functions', () => {
  let genericApiCallSpy: jest.SpyInstance;

  beforeEach(() => {
    genericApiCallSpy = jest.spyOn(functions, 'genericApiCall')
      .mockResolvedValue(['mocked result']);
  });

  afterEach(() => {
    genericApiCallSpy.mockRestore();
  });

  // it('v3_location_helper calls genericApiCall with powerGrid', async () => {
  //   await functions.v3_location_helper('2024-01-01', 'USA', 'CA', '', 'electricity', 100, 'kWh');

  //   expect(genericApiCallSpy).toHaveBeenCalledWith('location', {
  //     date: '2024-01-01',
  //     country: 'USA',
  //     stateProvince: 'CA',
  //     powerGrid: '',
  //     type: 'electricity',
  //     value: 100,
  //     unit: 'kWh',
  //   });
  // });

  it('v3_stationary_helper calls genericApiCall', async () => {
    await functions.v3_stationary_helper('2024-01-01', 'USA', 'CA', 'diesel', 50, 'L');

    expect(genericApiCallSpy).toHaveBeenCalledWith('stationary', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'diesel',
      value: 50,
      unit: 'L',
    });
  });

  it('v3_fugitive_helper calls genericApiCall', async () => {
    await functions.v3_fugitive_helper('2024-01-01', 'USA', 'CA', 'refrigerant', 10, 'kg');

    expect(genericApiCallSpy).toHaveBeenCalledWith('fugitive', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'refrigerant',
      value: 10,
      unit: 'kg',
    });
  });

  it('v3_mobile_helper calls genericApiCall', async () => {
    await functions.v3_mobile_helper('2024-01-01', 'USA', 'CA', 'gasoline', 75, 'L');

    expect(genericApiCallSpy).toHaveBeenCalledWith('mobile', {
      date: '2024-01-01',
      country: 'USA',
      stateProvince: 'CA',
      type: 'gasoline',
      value: 75,
      unit: 'L',
    });
  });

  // it('v3_calculation_helper calls genericApiCall with powerGrid', async () => {
  //   await functions.v3_calculation_helper('2024-01-01', 'USA', 'CA', 'PG&E', 'energy', 200, 'MWh');

  //   expect(genericApiCallSpy).toHaveBeenCalledWith('calculation', {
  //     date: '2024-01-01',
  //     country: 'USA',
  //     stateProvince: 'CA',
  //     powerGrid: 'PG&E',
  //     type: 'energy',
  //     value: 200,
  //     unit: 'MWh',
  //   });
  // });
});