function isIsoDate(str) {
  if (!isoDateRegex.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString().substring(0, 10) === str; // valid date
}

function getSteamID64(minProfileId) {
  return '76' + (parseInt(minProfileId, 10) + 561197960265728);
}

function parseTime(minutes, seconds) {
  let timeSecs = 0;
  timeSecs += parseInt(minutes, 10) * 60;
  timeSecs += parseInt(seconds, 10);
  return timeSecs;
}

function timeString(time) {
  let secs = time;
  const days = Math.floor(secs / (24 * 60 * 60));
  secs %= 86400;
  const hours = Math.floor(secs / (60 * 60))
    .toString()
    .padStart(2, '0');
  secs %= 3600;
  const mins = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  secs %= 60;
  secs = secs.toString().padStart(2, '0');

  let result = `${hours}:${mins}:${secs}`;
  if (days) result = `${days.toString()}d ${result}`;
  return result;
}

function updateTextContent(element, text, append) {
  if (!append) {
    element.textContent = '';
  }
  const format = (text, important, link) => {
    const textDiv = create('div');
    textDiv.textContent = text;
    if (important) {
      textDiv.classList.add('banchecker-red');
    }
    if (link) {
      textDiv.textContent = '';
      const linkElement = create('a');
      linkElement.target = '_blank';
      linkElement.href = link;
      linkElement.textContent = text;
      textDiv.appendChild(linkElement);
    }
    element.appendChild(textDiv);
  };
  if (text instanceof Array) {
    text.forEach((value) => format(value.text, value.important, value.link));
  } else {
    format(text, false, false);
  }
}

function create(tag, id) {
  const elt = document.createElement(tag);
  if (id) {
    elt.id = id;
  }
  return elt;
}

function getPourcentage(value, count) {
  return count ? Math.round((value / count) * 10000) / 100 : 0;
}
