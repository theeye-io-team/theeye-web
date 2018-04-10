const TYPE_FIXED = 'fixed'
const TYPE_INPUT = 'input'
const TYPE_SELECT = 'select'
const TYPE_DATE = 'date'
const TYPE_FILE = 'file'

exports.TYPE_FIXED = TYPE_FIXED
exports.TYPE_INPUT = TYPE_INPUT
exports.TYPE_SELECT = TYPE_SELECT
exports.TYPE_DATE = TYPE_DATE
exports.TYPE_FILE = TYPE_FILE

exports.TYPES = Object.freeze([
  { id: TYPE_FIXED, text: 'Fixed' },
  { id: TYPE_INPUT, text: 'Input' },
  { id: TYPE_SELECT, text: 'Select' },
  { id: TYPE_DATE, text: 'Date' },
  { id: TYPE_FILE, text: 'File' },
])
