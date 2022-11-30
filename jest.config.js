/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  bail: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [ "**/*-verification.ts" ],
  testTimeout: 600 * 1000,
  setupFilesAfterEnv: ['./test/config.js'],
};