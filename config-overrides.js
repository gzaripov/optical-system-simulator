const { injectBabelPlugin } = require('react-app-rewired');

function rewireStyledComponents(config, env, styledComponentsPluginOptions = {}) {
  return injectBabelPlugin(['styled-components', styledComponentsPluginOptions], config);
}

function rewireAntd(config) {
  return injectBabelPlugin(
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    config,
  );
}

module.exports = function override(config, env) {
  const rewiredConfig = rewireStyledComponents(config, env);
  return rewireAntd(rewiredConfig);
};
