/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [ "**/mip-*-verification.ts" ],
  testTimeout: 600 * 1000,
  setupFilesAfterEnv: ['./test/config.js'],
};