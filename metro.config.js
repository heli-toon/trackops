const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves the "react-native" condition in package.json exports
// This fixes Firebase Auth's "Component auth has not been registered yet" error
// by ensuring @firebase/auth resolves to its React Native build (which calls registerAuth)
config.resolver.unstable_conditionNames = [
  "react-native",
  "browser",
  "require",
  "import",
];

module.exports = config;
