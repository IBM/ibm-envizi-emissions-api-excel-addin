module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: 'dist/coverage'
};
