
import * as functions from '../src/functions_component/functions';

describe('Wrapper Functions', () => {
  let v3_stationary_helper_spy: jest.SpyInstance;

  beforeEach(() => {
    v3_stationary_helper_spy = jest.spyOn(functions, 'v3_stationary_helper').mockResolvedValue(['mocked stationary result']);

    jest.clearAllMocks(); 
  });

  afterEach(() => {
    v3_stationary_helper_spy.mockRestore();
  });

  it('v3_stationary calls v3_stationary_helper with decrypted row', async () => {
    const row = ['2024-01-01', 'USA', 'CA', 'diesel', 50, 'L'];
    const result = await functions.v3_stationary([row]);

    expect(v3_stationary_helper_spy).toHaveBeenCalledWith(
      '2024-01-01', 'USA', 'CA', 'diesel', 50, 'L'
    );
    expect(result).toEqual(['mocked stationary result']);
  });
});
