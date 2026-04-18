npm run build;
cp ./assets/* ./dist/cs2-ban-checker/browser/
mkdir ./dist/cs2-ban-checker/chrome/
mkdir ./dist/cs2-ban-checker/firefox/
cp -r ./dist/cs2-ban-checker/browser/* ./dist/cs2-ban-checker/chrome/
cp -r ./dist/cs2-ban-checker/browser/* ./dist/cs2-ban-checker/firefox/
mv ./dist/cs2-ban-checker/chrome/manifest_chrome.json ./dist/cs2-ban-checker/chrome/manifest.json
rm ./dist/cs2-ban-checker/chrome/manifest_firefox.json
mv ./dist/cs2-ban-checker/firefox/manifest_firefox.json ./dist/cs2-ban-checker/firefox/manifest.json
rm ./dist/cs2-ban-checker/chrome/index.html ./dist/cs2-ban-checker/chrome/favicon.ico
rm ./dist/cs2-ban-checker/firefox/index.html ./dist/cs2-ban-checker/firefox/favicon.ico
cd ./dist/cs2-ban-checker/chrome/ && zip ../chrome.zip ./* && cd -
cd ./dist/cs2-ban-checker/firefox/ && zip ../firefox.zip ./* && cd -