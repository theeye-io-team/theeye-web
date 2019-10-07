'use strict'

import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import Collection from 'ampersand-collection'
import { DynamicArgument as TaskArgument } from 'models/task/dynamic-argument'
import FieldConstants from 'constants/field'
import HelpIcon from 'components/help-icon'

// component dependencies
import ArgumentsCreator from './creator'
import ArgumentView from './argument'

module.exports = View.extend({
  template: `
	  <div class="form-group">
      <label class="col-sm-3 control-label" data-hook="label">Input Arguments</label>
      <div class="col-sm-9">
        <div style="padding-bottom: 15px;">
          <button data-hook="add-argument"
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
    },
    label: { hook: 'label' }
  },
  props: {
    visible: ['boolean',false,true],
    taskArguments: 'collection',
    name: ['string',false,'taskArguments'],
    label: ['string',false,'Task Arguments']
  },
  initialize (options) {
    // copy collection
    this.taskArguments = new Collection(options.value.serialize(), {
      parent: this,
      model: TaskArgument,
      comparator: 'order'
    })
    View.prototype.initialize.apply(this,arguments)
  },
  events: {
    'click [data-hook=add-argument]':'onClickAddScriptArgument',
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

    this.listenTo(creator,'added', arg => {
      creator.remove()
      modal.remove()
      this.onArgumentAdded(arg)
    })

    modal.show()

    return false
  },
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.taskArguments,
      ArgumentView,
      this.query('ul')
    )

    // when model removed change all arguments order to its new index
    this.listenTo(this.taskArguments,'remove',this.onArgumentRemoved)

    this.renderSubview(
      new HelpIcon({
        text: 'Click argument order to swap'
      }),
      this.queryByHook('order-row-header')
    )
  },
  onArgumentRemoved (argument) {
    this.taskArguments.models.forEach((arg,index) => {
      arg.order = index
    })
  },
  onArgumentAdded (argument) {
    // get the last id + 1
    if (this.taskArguments.length===0) {
      argument.id = 1
    } else {
      // taskArguments is not sorted by id
      argument.id = this.taskArguments.reduce((max,arg) => {
        return (arg.id>=max) ? arg.id : max
      },1) + 1 // starting from id 1 , get the last + 1
    }

    argument.order = this.taskArguments.length

    // fixed arguments does not has a label
    if (argument.type===FieldConstants.TYPE_FIXED) {
      //argument.label = `FixedArg${this.taskArguments.length}`
      argument.readonly = true
    }

    this.taskArguments.add( new TaskArgument(argument) )
    this.trigger('change:taskArguments')
  },
  /**
   * @param {Mixed} value array of objects/models or a collection
   */
  setValue (value) {
    if (value.isCollection) value = value.serialize()
    this.taskArguments.reset(value)
  },
  derived: {
    valid: {
      fn () {
        return true
      }
    },
    value: {
      cache: false,
      deps: ['taskArguments'],
      fn () {
        return this.taskArguments.map(arg => arg.serialize())
      }
    }
  }
})
