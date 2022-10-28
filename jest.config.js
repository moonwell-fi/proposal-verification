/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [ "**/*-*-verification.ts" ],
  testTimeout: 180 * 1000,
  maxConcurrency: 1,
  setupFilesAfterEnv: ['./test/config.js'],
};