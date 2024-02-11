npm run build;
cp ./assets/* ./dist/cs-history-ban-checker/browser/
mkdir ./dist/cs-history-ban-checker/chrome/
mkdir ./dist/cs-history-ban-checker/firefox/
cp -r ./dist/cs-history-ban-checker/browser/* ./dist/cs-history-ban-checker/chrome/
cp -r ./dist/cs-history-ban-checker/browser/* ./dist/cs-history-ban-checker/firefox/
mv ./dist/cs-history-ban-checker/chrome/manifest_chrome.json ./dist/cs-history-ban-checker/chrome/manifest.json
rm ./dist/cs-history-ban-checker/chrome/manifest_firefox.json
mv ./dist/cs-history-ban-checker/firefox/manifest_firefox.json ./dist/cs-history-ban-checker/firefox/manifest.json
rm ./dist/cs-history-ban-checker/chrome/index.html ./dist/cs-history-ban-checker/chrome/favicon.ico
rm ./dist/cs-history-ban-checker/firefox/index.html ./dist/cs-history-ban-checker/firefox/favicon.ico