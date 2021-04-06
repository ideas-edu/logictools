outputPath="$1"

echo "Installing PHP modules"
composer install
echo "Installing Node modules"
npm install
echo "Webpacking contents to $outputPath"
npx webpack --output-path "$outputPath"
