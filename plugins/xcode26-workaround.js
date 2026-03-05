// Expo config plugin: disables Swift explicit modules for Xcode 26 compatibility.
// Applied automatically during `expo prebuild` so Podfile edits survive regeneration.
const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withXcode26Workaround(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let podfile = fs.readFileSync(podfilePath, "utf8");

      const snippet = `\n    # Xcode 26 workaround: disable Swift explicit modules
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end
    end\n`;

      if (!podfile.includes("SWIFT_ENABLE_EXPLICIT_MODULES")) {
        // Insert snippet before the closing `end` of the post_install block.
        // The Podfile ends with:
        //   post_install do |installer|
        //     react_native_post_install(...)
        //   end
        // end
        // We insert before the first `  end` after `react_native_post_install`.
        podfile = podfile.replace(
          /(react_native_post_install\([\s\S]*?\)\n)(  end)/,
          `$1${snippet}  end`
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};
