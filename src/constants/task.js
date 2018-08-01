
exports.TYPE_SCRAPER = 'scraper'
exports.TYPE_SCRIPT = 'script'
exports.TYPE_APPROVAL = 'approval'
exports.TYPE_DUMMY = 'dummy'

exports.GRACE_TIME = Object.freeze([
  {
    secs: 0,
    mins: 0,
    text: 'No Wait / No cancelation'
  },
  {
    secs: 60,
    mins: 1,
    text: '1 Minutes'
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
