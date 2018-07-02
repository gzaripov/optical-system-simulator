const { injectBabelPlugin, getLoader } = require("react-app-rewired");
const tsImportPluginFactory = require("ts-import-plugin");

function rewireStyledComponents(
  config,
  env,
  styledComponentsPluginOptions = {}
) {
  return injectBabelPlugin(
    ["styled-components", styledComponentsPluginOptions],
    config
  );
}

function rewireAntd(config) {
  const tsLoader = getLoader(
    config.module.rules,
    rule =>
      rule.loader &&
      typeof rule.loader === "string" &&
      rule.loader.includes("ts-loader")
  );

  tsLoader.options = {
    getCustomTransformers: () => ({
      before: [
        tsImportPluginFactory({
          libraryDirectory: "es",
          libraryName: "antd",
          style: "css"
        })
      ]
    })
  };

  return config;
}

module.exports = function override(config, env) {
  const rewiredConfig = rewireStyledComponents(config, env);
  return rewireAntd(rewiredConfig);
};
