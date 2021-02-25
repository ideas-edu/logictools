/* global __dirname */

const path = require('path')

const CopyPlugin = require('copy-webpack-plugin')

const jsDir = path.resolve(__dirname, 'src/js')
const htmlDir = path.resolve(__dirname, 'src/html')
const cssDir = path.resolve(__dirname, 'src/css')
const imgDir = path.resolve(__dirname, 'src/img')
const pdfDir = path.resolve(__dirname, 'src/pdf')
const distDir = path.resolve(__dirname, 'dist')
const distCssDir = path.resolve(__dirname, 'dist/css')
const distImgDir = path.resolve(__dirname, 'dist/img')
const distPdfDir = path.resolve(__dirname, 'dist/pdf')

module.exports = {
  entry: {
    oneWaySolution: path.resolve(jsDir, 'controller/OneWaySolutionController.js'),
    oneWay: path.resolve(jsDir, 'controller/OneWayController.js'),
    twoWaySolution: path.resolve(jsDir, 'controller/TwoWaySolutionController.js'),
    twoWay: path.resolve(jsDir, 'controller/TwoWayController.js'),
    main: path.resolve(jsDir, 'controller/mainFrameController.js')
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
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
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
        { from: imgDir, to: distImgDir },
        { from: pdfDir, to: distPdfDir }
      ]
    })
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
