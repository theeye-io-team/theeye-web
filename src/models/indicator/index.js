import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import stateIcon from 'models/state-icon'
import stateOrder from 'models/state-order'
import IndicatorConstants from 'constants/indicator'
const config = require('config')

const urlRoot = `${config.api_v3_url}/indicator`

const BaseSchema = AppModel.extend({
  idAttribute: 'id',
  props: {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    user_id: 'string', // owner/creator
    description: 'string',
    alerts: 'boolean',
    _type: 'string',
    type: 'string',
    creation_date: 'date',
    last_update: 'date',
    secret: 'string',
    title: ['string'],
    severity: ['string',false,'low'],
    state: ['string',false,'normal'],
    acl: ['array', false, () => { return [] }],
    enable: ['boolean',false,true],
    sticky: ['boolean',false,false],
    read_only: ['boolean',false,false]
  },
  derived: {
    order: {
      //deps: [],
      fn () {
        return this.name
      }
    },
    formatted_tags: {
      deps: ['title','_type','type','state','severity','tags','description','acl','read_only'],
      fn () {
        return [
          this.title,
          this.state,
          this._type,
          this.description,
          this.severity,
          (this.read_only?'read only':undefined)
        ].concat(this.acl, this.tags)
      }
    },
    stateSeverity: {
      deps: ['state','severity'],
      fn () {
        const state = (this.state || 'error').toLowerCase()
        const severity = (this.severity || 'high').toLowerCase()

        if (state==='failure') {
          return severity
        } else {
          return state
        }
      }
    },
    stateIcon: {
      deps: ['stateSeverity'],
      fn () {
        return stateIcon[ this.stateSeverity ]
      }
    },
    stateOrder: {
      deps: ['stateSeverity'],
      fn () {
        return stateOrder.orderOf( this.stateSeverity )
      }
    },
  }
  //children: {
  //  user: User,
  //  customer: Customer,
  //},
})

const Indicator = BaseSchema.extend({
  urlRoot,
  session: {
    _all: 'object' // keep properties returned by the server as is
  },
  mutate () {
    return new IndicatorFactory(this._all)
  },
  parse (attrs) {
    this._all = attrs
    return attrs
  }
})

const ProgressIndicator = Indicator.extend({
  props: {
    value: ['number', false, 0],
    type: ['string', false, 'progress']
  }
})

const CounterIndicator = Indicator.extend({
  props: {
    value: ['number', false, 0],
    type: ['string', false, 'counter']
  }
})

const TextIndicator = Indicator.extend({
  props: {
    value: ['string', false, ''],
    type: ['string', false, 'text']
  }
})

function IndicatorFactory (attrs, options={}) {
  let store = App.state.indicators
  if (attrs.isCollection) { return attrs }
  if (attrs.isState) { return attrs } // already constructed

  let model

  if (attrs.id) {
    model = store.get(attrs.id)
    if (model) {
      model.set(attrs)
      return model
    }
  }

  const createModel = () => {
    let type = attrs._type
    let model
    switch (type) {
      case IndicatorConstants.TEXT_TYPE:
        model = new TextIndicator(attrs, options)
        break
      case IndicatorConstants.PROGRESS_TYPE:
        model = new ProgressIndicator(attrs, options)
        break
      case IndicatorConstants.INDICATOR_TYPE:
        model = new Indicator(attrs, options)
        break
      case IndicatorConstants.COUNTER_TYPE:
        model = new CounterIndicator(attrs, options)
        break
      default:
        let err = new Error(`unrecognized type ${type}`)
        throw err
        break
    }
    return model
  }

  model = createModel()
  if (
    options.collection !== store &&
    !model.isNew()
  ) {
    store.add(model, { merge: true })
  }
  return model
}

const Collection = AppCollection.extend({
  //comparator: 'creation_date',
  comparator (m1,m2) {
    // sort by state order
    if (m1.order > m2.order) {
      return -1
    } else if (m1.order < m2.order) {
      return 1
    } else {
      // if equal state order, sort by name
      let name1 = m1.name ? m1.name.toLowerCase() : 0
      let name2 = m2.name ? m2.name.toLowerCase() : 0
      if (name1 > name2) { return -1 }
      else if (name1 < name2) { return 1 }
      else return 0
    }
  },
  url: urlRoot,
  model: IndicatorFactory,
  isModel (model) {
    let isModel = (
      model instanceof TextIndicator ||
      model instanceof ProgressIndicator ||
      model instanceof CounterIndicator ||
      model instanceof Indicator
    )
    return isModel
  }
})

exports.Indicator = Indicator
exports.Counter = CounterIndicator
exports.Progress = ProgressIndicator
exports.Text = TextIndicator
exports.Factory = IndicatorFactory
exports.Collection = Collection
