
import AppCollection from 'lib/app-collection'

import Schema from './schema'
import config from 'config'

const urlRoot = `${config.api_url}/inbox`
const Model = Schema.extend({ urlRoot: urlRoot })

const Collection = AppCollection.extend({
  comparator: function (a, b) {
    return b.creation_date - a.creation_date
  },
  model: Model,
  url: urlRoot
})

export { Model, Collection }
