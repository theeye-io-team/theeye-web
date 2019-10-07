import State from 'ampersand-state'
import Model from 'ampersand-model'
import Collection from 'ampersand-collection'

const ValueOption = State.extend({
  props: {
    id: 'string',
    label: 'string',
    order: 'number'
  }
})

exports.ValueOption = ValueOption

const OptionsCollection = Collection.extend({
  mainIndex: 'id',
  indexes: ['id','label'],
  model: ValueOption
})

exports.DynamicArgument = Model.extend({
  props: {
    id: ['number',true], // incremental id
    _id: 'string',
    order: ['number',true],
    type: ['string',true],
    label: ['string',true],
    value: ['string',false],
    help: ['string',true],
    readonly: ['boolean',false,false],
    //options: ['array',false,() => { return [] }],
    required: ['boolean',false,true],
    endpoint_url: ['string',false],
    id_attribute: ['string',false],
    text_attribute: ['string',false],
    masked: ['boolean',false,false]
  },
  collections: {
    options: OptionsCollection
  },
  //parse (attrs) {
  //  attrs.id = Number(attrs.id)
  //  return attrs
  //}
})
