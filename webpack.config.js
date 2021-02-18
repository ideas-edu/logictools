/* global __dirname */

const path = require('path')

const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')

const jsDir = path.resolve(__dirname, 'src/js')
const htmlDir = path.resolve(__dirname, 'src/html')
const cssDir = path.resolve(__dirname, 'src/css')
// const sharedDir = path.resolve(__dirname, 'src/shared')
const imgDir = path.resolve(__dirname, 'src/img')
const fontDir = path.resolve(__dirname, 'src/font')
const distDir = path.resolve(__dirname, 'dist')
const distCssDir = path.resolve(__dirname, 'dist/css')
// const distSharedDir = path.resolve(__dirname, 'dist/shared')
const distImgDir = path.resolve(__dirname, 'dist/img')
const distFontDir = path.resolve(__dirname, 'dist/font')

module.exports = {
  entry: {
    oneWaySolution: path.resolve(jsDir, 'controller/OneWaySolutionController.js'),
    oneWay: path.resolve(jsDir, 'controller/OneWayController.js'),
    main: path.resolve(jsDir, 'mainFrameController.js')
    // kbinput: path.resolve(sharedDir, 'kbinput/kbinput.js')
  },
  output: {
    path: distDir,
    filename: '[name].bundle.js'
  },
  devServer: {
    contentBase: distDir
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  // module: {
  //   loaders: [
  //     {
  //       loader: 'babel-loader',
  //       test: jsDir
  //     }
  //   ]
  // },
  plugins: [
    // Simply copies the files over
    new CopyPlugin({
      patterns: [
        { from: htmlDir }, // to: output.path
        { from: cssDir, to: distCssDir },
        // { from: sharedDir, to: distSharedDir },
        { from: imgDir, to: distImgDir },
        { from: fontDir, to: distFontDir }
      ]
    }),
    // Avoid publishing files when compilation fails
    // new webpack.NoErrorsPlugin()
  ],
  stats: {
    // Nice colored output
    colors: true
  },
  // Create Sourcemaps for the bundle
  devtool: 'source-map'
}

// module.exports = {
//   plugins: [
//     new CopyPlugin({
//       patterns: [
//         { from: 'src/css', to: 'dist/css' }
//       ]
//     })
//   ]
// }
