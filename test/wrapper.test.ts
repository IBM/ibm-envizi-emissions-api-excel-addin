import * as functions from '../src/functions_component/functions';

jest.mock('../src/functions_component/functions');

const mockedFunctions = functions as jest.Mocked<typeof functions>;

describe('Wrapper Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  

  it('v3_stationary calls v3_stationary_helper with decrypted row', async () => {
    mockedFunctions.v3_stationary_helper.mockResolvedValue(['stationary result']);

    const row = ['2024-01-01', 'USA', 'CA', 'diesel', 50, 'L'];

    const result = await functions.v3_stationary([row]);

    expect(mockedFunctions.v3_stationary_helper).toHaveBeenCalledWith(
      '2024-01-01', 'USA', 'CA', 'diesel', 50, 'L'
    );
    expect(result).toEqual(['stationary result']);
  });

  it('v3_fugitive calls v3_fugitive_helper with decrypted row', async () => {
    mockedFunctions.v3_fugitive_helper.mockResolvedValue(['fugitive result']);

    const row = ['2024-01-01', 'USA', 'CA', 'refrigerant', 10, 'kg'];

    const result = await functions.v3_fugitive([row]);

    expect(mockedFunctions.v3_fugitive_helper).toHaveBeenCalledWith(
      '2024-01-01', 'USA', 'CA', 'refrigerant', 10, 'kg'
    );
    expect(result).toEqual(['fugitive result']);
  });

  it('v3_mobile calls v3_mobile_helper with decrypted row', async () => {
    mockedFunctions.v3_mobile_helper.mockResolvedValue(['mobile result']);

    const row = ['2024-01-01', 'USA', 'CA', 'gasoline', 75, 'L'];

    const result = await functions.v3_mobile([row]);

    expect(mockedFunctions.v3_mobile_helper).toHaveBeenCalledWith(
      '2024-01-01', 'USA', 'CA', 'gasoline', 75, 'L'
    );
    expect(result).toEqual(['mobile result']);
  });

});
