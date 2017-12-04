'use strict'

import View from 'ampersand-view'
import ArgumentsCreator from './creator'
import Modalizer from 'components/modalizer'
import ArgumentView from './argument'
import Collection from 'ampersand-collection'
import { DinamicArgument as ScriptArgument } from 'models/task/dinamic-argument'
import FieldConstants from 'constants/field'
import HelpIcon from 'components/help-icon'

//const ArgumentsCollection = Collection.extend({
//  //mainIndex: 'id',
//  //indexes: ['order'],
//  model: ScriptArgument,
//  comparator: 'order'
//})

module.exports = View.extend({
  template: `
	  <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label">Script Arguments</label>
      <div class="col-sm-9">
        <div style="padding-bottom: 15px;">
          <button data-hook="add-script-argument"
            title="add new argument"
            class="btn btn-default"> Add arguments <i class="fa fa-plus"></i>
          </button>
        </div>
  			<ul class="list-group">
          <li class="list-group-item">
            <div class="row" style="line-height: 30px;">
              <span data-hook="order-row-header" class="col-xs-1">#</span>
              <span class="col-xs-2">Type</span>
              <span class="col-xs-4">Label</span>
              <span class="col-xs-3">Value</span>
              <span></span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  props: {
    visible: ['boolean',false,true],
    scriptArguments: 'collection',
    name: ['string',false,'scriptArguments']
  },
  initialize (options) {
    // copy collection
    this.scriptArguments = new Collection(options.value.serialize(), {
      parent: this,
      model: ScriptArgument,
      comparator: 'order'
    })
    View.prototype.initialize.apply(this,arguments)
  },
  events: {
    'click [data-hook=add-script-argument]':'onClickAddScriptArgument',
  },
  onClickAddScriptArgument (event) {
    event.preventDefault()
    event.stopPropagation()

    const creator = new ArgumentsCreator()

    const modal = new Modalizer({
      buttons: false,
      title: 'Arguments Creation',
      bodyView: creator
    })

    this.listenTo(modal,'hidden',() => {
      creator.remove()
      modal.remove()
    })

    this.listenTo(creator,'added',this.onArgumentAdded)

    modal.show()

    return false
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.scriptArguments,
      ArgumentView,
      this.query('ul')
    )

    // when model removed change all arguments order to its new index
    this.listenTo(this.scriptArguments,'remove',this.onArgumentRemoved)

    this.renderSubview(
      new HelpIcon({
        text: 'Click argument order to swap'
      }),
      this.queryByHook('order-row-header')
    )
  },
  onArgumentRemoved (argument) {
    this.scriptArguments.models.forEach((arg,index) => {
      arg.order = index
    })
  },
  onArgumentAdded (argument) {
    // get the last id + 1
    if (this.scriptArguments.length===0) {
      argument.id = 1
    } else {
      // scriptArguments is not sorted by id
      argument.id = this.scriptArguments.reduce((max,arg) => {
        return (arg.id>=max) ? arg.id : max
      },1) + 1 // starting from id 1 , get the last + 1
    }

    argument.order = this.scriptArguments.length

    // fixed arguments does not has a label
    if (argument.type===FieldConstants.TYPE_FIXED) {
      argument.label = `FixedArg${this.scriptArguments.length}`
      argument.readonly = true
    }

    this.scriptArguments.add( new ScriptArgument(argument) )
    this.trigger('change:scriptArguments')
  },
  /**
   * @param {Mixed} value array of objects/models or a collection
   */
  setValue (value) {
    if (value.isCollection) value = value.serialize()
    this.scriptArguments.reset(value)
  },
  derived: {
    valid: {
      fn () {
        return true
      }
    },
    value: {
      cache: false,
      deps: ['scriptArguments'],
      fn () {
        return this.scriptArguments.map(arg => arg.serialize())
      }
    }
  }
})
