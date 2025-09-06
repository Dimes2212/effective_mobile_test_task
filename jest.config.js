const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;


/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  setupFiles: ["dotenv/config"], 
};
