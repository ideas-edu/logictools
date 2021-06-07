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

## Configuration
Copy the `config.json.example` file to `config.json` and fill in the configuration file. To disable certain tools from being used remove the respective entry from the `tools` key.
