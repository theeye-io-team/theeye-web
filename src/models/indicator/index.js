import App from 'ampersand-app'
import State from 'ampersand-state'
import AppCollection from 'lib/app-collection'
import AppModel from 'lib/app-model'
import stateIcon from 'models/state-icon'
import stateOrder from 'models/state-order'
import * as IndicatorConstants from 'constants/indicator'
import { Collection as TagCollection } from 'models/tag'
import config from 'config'

const urlRoot = `${config.supervisor_api_url}/indicator`
import baseProperties from '../baseProperties'

const BaseSchema = AppModel.extend({
  idAttribute: 'id',
  props: Object.assign({}, {
    id: 'string',
    customer_id: 'string',
    customer_name: 'string',
    user_id: 'string', // owner/creator
    description: 'string',
    alerts: 'boolean',
    secret: 'string',
    title: ['string'],
    tags: ['array',false, () => { return [] }],
    severity: ['string',false,'low'],
    state: ['string',false,'normal'],
    acl: ['array', false, () => { return [] }],
    enable: ['boolean',false,true],
    width: ['number', true, 2],
    height: ['number', true, 2],
    sticky: ['boolean',false,false],
    read_only: ['boolean',false,false]
  }, baseProperties),
  session: {
    tagsCollection: 'collection'
  },
  derived: {
    formatted_tags: {
      deps: ['title','_type','type','state','severity','tags','acl','read_only'],
      fn () {
        return [
          this.title,
          this.state,
          this._type,
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
  },
  initialize () {
    AppModel.prototype.initialize.apply(this,arguments)

    this.bindTagsEvents()
  },
  bindTagsEvents () {
    this.tagsCollection = new TagCollection([])
    this.listenToAndRun(this, 'change:tags', () => {
      if (Array.isArray(this.tags)) {
        let tags = this.tags.map((tag, index) => {
          return {_id: (index + 1).toString(), name: tag}
        })
        tags = tags.slice(0, 3)
        this.tagsCollection.set(tags)
      }
    })
  }
  //children: {
  //  user: User,
  //  customer: Customer,
  //},
})

export const Indicator = BaseSchema.extend({
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
    type: ['string', false, IndicatorConstants.PROGRESS_TYPE_SHORT]
  }
})

const ChartIndicator = Indicator.extend({
  props: {
    value: ['object', false, () => {
      return {}
    }],
    type: ['string', false, IndicatorConstants.CHART_TYPE_SHORT]
  }
})

const CounterIndicator = Indicator.extend({
  props: {
    value: ['number', false, 0],
    type: ['string', false, IndicatorConstants.COUNTER_TYPE_SHORT]
  }
})

const TextIndicator = Indicator.extend({
  props: {
    value: ['string', false, ''],
    type: ['string', false, IndicatorConstants.TEXT_TYPE_SHORT]
  }
})

const HTMLIndicator = Indicator.extend({
  props: {
    value: ['string', false, ''],
    type: ['string', false, IndicatorConstants.HTML_TYPE_SHORT]
  }
})

const FileIndicator = Indicator.extend({
  props: {
    value: ['string', false, ''],
    type: ['string', false, IndicatorConstants.FILE_TYPE_SHORT]
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
      case IndicatorConstants.CHART_TYPE:
        model = new ChartIndicator(attrs, options)
        break
      case IndicatorConstants.HTML_TYPE:
        model = new HTMLIndicator(attrs, options)
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
      case IndicatorConstants.FILE_TYPE:
        model = new FileIndicator(attrs, options)
        break
      case IndicatorConstants.TEXT_TYPE:
      default:
        model = new TextIndicator(attrs, options)
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

export const Collection = AppCollection.extend({
  comparator (m1, m2) {
    if (m1.order > m2.order) {
      return 1
    } else if (m1.order < m2.order) {
      return -1
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
      model instanceof ChartIndicator ||
      model instanceof TextIndicator ||
      model instanceof HTMLIndicator ||
      model instanceof ProgressIndicator ||
      model instanceof CounterIndicator ||
      model instanceof Indicator
    )
    return isModel
  }
})

export const Counter = CounterIndicator
export const Progress = ProgressIndicator
export const Text = TextIndicator
export const HTML = HTMLIndicator
export const Chart = ChartIndicator
export const Factory = IndicatorFactory
