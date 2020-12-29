module.exports = function (api) {
  /* eslint no-process-env: 0 */
  const { NODE_ENV } = process.env;
  api.cache.using(() => NODE_ENV || 'development');

  const presets = [ '@babel/preset-react' ];
  if (NODE_ENV === 'test') presets.push('@babel/preset-env');

  return {
    presets,
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-export-namespace-from',
    ],
  };
};
