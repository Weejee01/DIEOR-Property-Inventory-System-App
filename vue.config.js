const path = require('path');

module.exports = {
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,  // Ensure 'fs' module is not used
        path: require.resolve('path-browserify') // Use 'path-browserify' as fallback
      }
    }
  }
};