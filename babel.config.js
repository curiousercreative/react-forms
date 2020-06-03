module.exports = function (api) {
  api.cache.using(() => process.env.NODE_ENV || 'development');

  return {
    presets: [
      [ '@babel/preset-env', {
        modules: process.env.NODE_ENV === 'test' ? 'auto' : false,
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
