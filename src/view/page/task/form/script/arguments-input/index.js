'use strict'

import View from 'ampersand-view'
import ArgumentsCreator from './creator'
import Modalizer from 'components/modalizer'
import ArgumentView from './argument'
import Collection from 'ampersand-collection'
import { DinamicArgument as ScriptArgument } from 'models/task/dinamic-argument'
import FIELD from 'constants/field'

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
  			<ul class="list-group"></ul>
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
    this.scriptArguments = new Collection(options.value.serialize(), { model: ScriptArgument })
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

    this.listenTo(creator,'added',(argument) => {
      // fixed arguments does not has a label
      argument.id = this.scriptArguments.length
      argument.order = this.scriptArguments.length

      if (argument.type===FIELD.TYPE_FIXED) {
        argument.label = `FixedArg${this.scriptArguments.length}`
        argument.readonly = true
      }

      this.scriptArguments.add(argument)
      this.trigger('change:scriptArguments')
    })

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
