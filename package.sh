# !/bin/bash

VERSION=$(grep '"version":' manifest_chrome.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo "Ban Checker version in manifest.json: $VERSION. This script will pack everything into output folder";

echo "Creating output folders";

rm -rf output;
mkdir output;
mkdir output/chrome;
mkdir output/firefox;

echo "Moving files into output folders...";

cp *.js output/chrome;
cp *.js output/firefox;
cp *.png output/chrome;
cp *.png output/firefox;
cp display.css output/chrome;
cp display.css output/firefox;
cp manifest_chrome.json output/chrome/manifest.json;
cp manifest_firefox.json output/firefox/manifest.json;

echo "Done!";