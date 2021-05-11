/* global __dirname */
const config = require('./src/js/config.json')

const path = require('path')

const CopyPlugin = require('copy-webpack-plugin')

const jsDir = path.resolve(__dirname, 'src/js')
const htmlDir = path.resolve(__dirname, 'src/html')
const cssDir = path.resolve(__dirname, 'src/css')
const langDir = path.resolve(__dirname, 'src/lang')
const assetDir = path.resolve(__dirname, 'src/assets')
const distDir = path.resolve(__dirname, 'dist')

module.exports = {
  entry: {
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
  plugins: [
    // Simply copies the files over
    new CopyPlugin({
      patterns: [
        { from: htmlDir }, // to: output.path
        { from: cssDir, to: 'css/' },
        { from: langDir, to: 'lang/' },
        { from: assetDir, to: 'assets/' }
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

for (const tool of Object.values(config.tools)) {
  for (const [identifier, location] of Object.entries(tool.bundles)) {
    module.exports.entry[identifier] = path.resolve(jsDir, location)
  }
}
