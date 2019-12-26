module.exports = {
  roots: ["<rootDir>"],
  preset: "ts-jest",
  collectCoverageFrom: ["lib/**/*.{ts,tsx}"],
  testPathIgnorePatterns: ["/dist"],
  testRegex: "\\.test\\.ts"
};
