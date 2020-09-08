
export default {
  order: ['number', false, 0],
  creation_date: ['date', false, () => { return new Date() }],
  last_update: ['date', false, () => { return new Date() }],
  _type: 'string',
  type: 'string',
}
