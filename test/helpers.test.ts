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

});