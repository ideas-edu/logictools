#!/bin/sh
outputPath="$1"
config=${2-config.json}

[ -f $config ] || { echo "Missing config file"; return; }

if [[ $config != config.json ]]; then
	[ -f "config.json" ] && { echo "You cannot use a custom config file when a config.json file is present"; return; }
	config=true
	echo "Using config file $2"
	cp $2 "./config.json"
fi

echo "Installing PHP modules"
composer install
echo "Installing Node modules"
npm install
echo "Webpacking contents to $outputPath"
npx webpack --mode=production --output-path "$outputPath"

if [[ $config != "config.json" ]]; then
	rm "./config.json"
fi
