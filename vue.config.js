const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
      // new CopyWebpackPlugin({
      //   patterns: [
      //     {
      //       from: path.resolve(__dirname, "jsonFiles"),
      //       to: "jsonFiles",
      //     },
      //   ],
      // }),
    ],
    resolve: {
      fallback: {
        fs: false,
        path: require.resolve("path-browserify"),
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        extraResources: [
          {
            from: path.join(__dirname, "jsonFiles"),
            to: "jsonFiles",
            filter: ["**/*"],
          },
        ],
        appId: "com.dieor.inventoryapp",
        productName: "Dieor Inventory App",
        win: {
          icon: "public/dieor_logo.ico",
        },
        mac: {
          icon: "public/dieor_logo.icns",
        },
        linux: {
          icon: "public/dieor_logo.png",
        },
      },
      preload: "src/preload.js",
    },
  },
};
