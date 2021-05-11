#!/bin/sh
outputPath="$1"

[ -f "config.json" ] || { echo "Missing config.json file"; return; }

echo "Installing PHP modules"
composer install
echo "Installing Node modules"
npm install
echo "Webpacking contents to $outputPath"
npx webpack --mode=production --output-path "$outputPath"
