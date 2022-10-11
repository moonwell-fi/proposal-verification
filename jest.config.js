/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [ "**/mip-*-verification.ts" ],
  testTimeout: 60 * 1000,
  maxConcurrency: 1,
  setupFilesAfterEnv: ['./test/config.js'],
};