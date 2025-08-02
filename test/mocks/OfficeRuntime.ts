export const storage = {
  getItem: jest.fn((key) => {
    if (key === 'apiKey') return Promise.resolve('mock-api-key');
    if (key === 'clientId') return Promise.resolve('mock-client-id');
    return Promise.resolve(null);
  }),
};
