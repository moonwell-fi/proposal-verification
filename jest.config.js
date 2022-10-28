/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [ "**/mip-*-verification.ts" ],
<<<<<<< HEAD
  testTimeout: 180 * 1000,
  maxConcurrency: 1,
=======
  testTimeout: 60 * 1000,
>>>>>>> origin/master
  setupFilesAfterEnv: ['./test/config.js'],
};