# !/bin/bash

# This script will pack everything into BanChecker_BROWSER_{VERSION}.zip ready for
# uploading to the Chrome Store and Add-ons for Firefox. This way we can use unpacked extension while developing without changing
# any filename or manifest.json or manually replacing files.

# Use "Bash on Ubuntu on Windows" if you're on Windows 10 or cygwin to run on Windows.

VERSION=$(grep '"version":' manifest.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo "Ban Checker version in manifest.json: $VERSION. This script will pack everything into output folder";

echo "Creating output folder";

rm -rf output;
mkdir output;

cp *.js output;

echo "Moving files into output folders...";
cp display.css output;
cp options.html output;
cp manifest.json output;

echo "Done!";