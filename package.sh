# !/bin/bash

# This script will pack everything into BanChecker_BROWSER_{VERSION}.zip ready for
# uploading to the Chrome Store and Add-ons for Firefox. This way we can use unpacked extension while developing without changing
# any filename or manifest.json or manually replacing files.

# Use "Bash on Ubuntu on Windows" if you're on Windows 10 or cygwin to run on Windows.

VERSION=$(grep '"version":' manifest-chrome.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo "Ban Checker version in manifest.json: $VERSION. This script will pack everything into chrome-output and firefox-output";

echo "Creating temp folder that will hold files.";

rm -rf chrome-output;
rm -rf firefox-output;
mkdir chrome-output;
mkdir firefox-output;

cp *.js chrome-output;
cp *.js firefox-output;

echo "Moving all other files into temp folder...";
cp -a icons chrome-output/icons;
cp display.css chrome-output;
cp options.html chrome-output;
cp manifest-chrome.json chrome-output/manifest.json;

cp -a icons firefox-output/icons;
cp display.css firefox-output;
cp options.html firefox-output;
cp manifest-firefox.json firefox-output/manifest.json;

echo "Done!";