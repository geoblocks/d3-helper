module.exports = {
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest", // <- transform JS files
  },
  testRegex: "/src/.*\\.spec.(ts|js)$",
  collectCoverageFrom: [
    "src/*.ts"
  ],
  transformIgnorePatterns: [
    "/node_modules/(?!(d3-array|d3-selection|d3-axis|d3-format|d3-time-format|d3-scale)/)",
  ],
};
