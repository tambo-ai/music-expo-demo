const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .mjs so Metro can resolve ES module packages (e.g. @strudel/*)
config.resolver.sourceExts.push("mjs");

// Stub web-only dependencies that get pulled in transitively
const upstreamResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-dom" ||
    moduleName.startsWith("react-dom/") ||
    moduleName === "react-media-recorder" ||
    moduleName.startsWith("@kabelsalat/")
  ) {
    return { type: "empty" };
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
