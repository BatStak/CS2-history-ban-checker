function saveOptions() {
  var yourapikey = document.getElementById('yourapikey').value;
  chrome.storage.sync.set({ yourapikey: yourapikey });
  window.close();
}

function restoreOptions() {
  chrome.storage.sync.get(['yourapikey'], function (data) {
    if (data['yourapikey']) {
      document.getElementById('yourapikey').value = data['yourapikey'];
    }
  });
}

function initOptions() {
  restoreOptions();
  document.getElementById('save').addEventListener('click', saveOptions);
}

if (document.location.protocol != 'http:' && document.location.protocol != 'https:') {
  document.addEventListener('DOMContentLoaded', initOptions);
}
