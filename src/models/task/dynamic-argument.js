import State from 'ampersand-state'
import Model from 'ampersand-model'
import Collection from 'ampersand-collection'

import * as TaskConstants from 'constants/task'

const ValueOption = State.extend({
  props: {
    id: 'string',
    label: 'string',
    order: 'number'
  }
})

const OptionsCollection = Collection.extend({
  mainIndex: 'id',
  indexes: ['id','label'],
  model: ValueOption
})

const DynamicArgument = Model.extend({
  props: {
    id: ['number',true], // incremental id
    _id: 'string',
    order: ['number',true],
    type: ['string',true],
    label: ['string',true],
    value: ['string',false,''], // default empty string
    help: ['string',true],
    readonly: ['boolean',false,false],
    //options: ['array',false,() => { return [] }],
    required: ['boolean',false,true],
    multiple: ['boolean',false,false],
    endpoint_url: ['string',false],
    id_attribute: ['string',false],
    text_attribute: ['string',false],
    masked: ['boolean',false,false],
    charsmin: ['number',false],
    charsmax: ['number',false],
    charset: ['string',false],
    pattern: ['string',false],
    version: ['string',false]
  },
  collections: {
    options: OptionsCollection
  }
})

export { ValueOption, DynamicArgument }
