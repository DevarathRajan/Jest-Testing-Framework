module.exports = {
  testEnvironment: "jsdom",

  // Tell Jest to treat JSX as ESM-like so Babel can transform import.meta
  extensionsToTreatAsEsm: [".jsx"],

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  transformIgnorePatterns: ["/node_modules/"],

  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
  },

  // Required for Jest 30+ when mixing CJS config + ESM modules
  resolver: undefined,
};
