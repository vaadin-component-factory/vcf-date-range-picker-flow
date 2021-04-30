module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
          useBuiltIns: 'entry',
          targets: {
            ie: 11
          }
        }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime', 
        {corejs: '3'}
      ]
    ]
};