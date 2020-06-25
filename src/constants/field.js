export const TYPE_FIXED = 'fixed'
export const TYPE_INPUT = 'input'
export const TYPE_SELECT = 'select'
export const TYPE_DATE = 'date'
export const TYPE_EMAIL = 'email'
export const TYPE_REGEXP = 'regexp'
export const TYPE_FILE = 'file'
export const TYPE_REMOTE_OPTIONS = 'remote-options'

export const TYPES = Object.freeze([
  { id: TYPE_REGEXP, text: 'Regular Expresion' },
  { id: TYPE_EMAIL, text: 'Email' },
  { id: TYPE_FIXED, text: 'Fixed' },
  { id: TYPE_INPUT, text: 'Input' },
  { id: TYPE_SELECT, text: 'Select' },
  { id: TYPE_DATE, text: 'Date' },
  { id: TYPE_FILE, text: 'File' },
  { id: TYPE_REMOTE_OPTIONS, text: 'Remote Options' }
])
