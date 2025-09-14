/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  transformIgnorePatterns: [
    "node_modules/(?!react-error-boundary/)",
  ],
};