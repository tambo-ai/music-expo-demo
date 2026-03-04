const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .mjs so Metro can resolve ES module packages (e.g. @strudel/*)
config.resolver.sourceExts.push("mjs");

// Shim web-only packages that are hard deps of @strudel/core but unused in RN
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.startsWith("@kabelsalat/") ||
    moduleName === "react-dom"
  ) {
    return {
      type: "empty",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
