/* eslint no-process-env: 0 */

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [ '@babel/preset-env', {
        targets: {
          node: '10',
        },
      }],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-export-namespace-from',
    ],
  };
};
