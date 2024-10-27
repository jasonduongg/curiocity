module.exports = {
  preset: "ts-jest", // Ensures Jest works with TypeScript
  testEnvironment: "jsdom", // Use jsdom for DOM support in tests
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"], // Points to your jest.setup.js
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transformIgnorePatterns: [
    "/node_modules/(?!(@testing-library|react-quill)/)",
  ],
};
