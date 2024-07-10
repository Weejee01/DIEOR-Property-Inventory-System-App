const path = require('path');

module.exports = {
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        path: require.resolve('path-browserify')
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.dieor.inventoryapp",
        productName: "Dieor Inventory App",
        win: {
          icon: "public/icons/dieor_logo.ico"
        },
        mac: {
          icon: "public/icons/dieor_logo.icns"
        },
        linux: {
          icon: "public/icons/dieor_logo.png"
        }
      }
    }
  }
};