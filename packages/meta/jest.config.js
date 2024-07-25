// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A map from regular expressions to module names that allow to stub out resources with a single module
  // moduleNameMapper: {},
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/../../__mocks__/fileMock.js",
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.svg$": "@svgr/webpack"
  },
  // The test editorEnvironment that will be used for testing
  testEnvironment: "jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/**/*.(spec|test).[tj]s?(x)"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "\\.tsx?$": "ts-jest",
    "\\.jsx?$": "babel-jest"
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    "<rootDir>/(config|dist|node_modules)/"
  ],
};

