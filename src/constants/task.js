
exports.TYPE_SCRAPER = 'scraper'
exports.TYPE_SCRIPT = 'script'

exports.GRACE_TIME = Object.freeze([
  {
    secs: 0,
    mins: 0,
    text: 'No Wait / No cancelation'
  },
  {
    secs: 300,
    mins: 5,
    text: '5 Minutes'
  },
  {
    secs: 600,
    mins: 10,
    text: '10 Minutes'
  },
  {
    secs: 900,
    mins: 15,
    text: '15 Minutes'
  },
])
