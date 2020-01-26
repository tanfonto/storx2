module.exports = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  collectCoverageFrom: ['lib/**/*.{ts,tsx}', '!lib/index.ts'],
  testPathIgnorePatterns: ['/dist', '/lib/index'],
  testRegex: '\\.test\\.ts'
};
