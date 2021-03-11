[![GitHub Super-Linter](https://github.com/ideas-edu/logictools/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)
[![Build Status](https://travis-ci.org/ideas-edu/logictools.svg?branch=main)](https://travis-ci.org/ideas-edu/logictools)

# Logic Tools
Logic Tools is a project of [IDEAS](https://ideas.science.uu.nl//#projects).

## Installation
### Requirements
You will need [npm](https://www.npmjs.com/get-npm) to be able to compile this project. We use [webpack](https://webpack.js.org) to bundle the `src` files together. Run
```sh
npm install
```
to install the requirements found in `package.json`. With the requirements installed you can run
```sh
npx webpack
```
to compile the `src` directory into bundles. You can also specify the directory that webpack outputs to with `-o output_dir`.

### Developer Server
The [Webpack-dev-server](https://github.com/webpack/webpack-dev-server) can be enabled by calling the following command.
```sh
node_modules/.bin/webpack serve
```
This will automatically update when changes are made in `src`.

### Production Server
In production the server (nginx/apache) can serve the files generated by webpack. Remember to use `--mode="production"` when calling `webpack` to generate the production distribution.
