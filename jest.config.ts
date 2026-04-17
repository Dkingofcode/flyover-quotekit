/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // This is the key fix for p-limit (ESM dependency)
  transformIgnorePatterns: [
    'node_modules/(?!p-limit|yocto-queue)'
  ],

  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }]
  },

  collectCoverage: true,
  coverageDirectory: 'coverage',
  verbose: true,
};