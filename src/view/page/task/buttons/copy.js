'use strict'

import assign from 'lodash/assign'
import PanelButton from 'components/list/item/panel-button'
import Modalizer from 'components/modalizer'
import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import TaskActions from 'actions/task'

const CopyForm = FormView.extend({
  initialize () {
    this.fields = [
      new SelectView({
        label: 'Target Hosts *',
        name: 'hosts',
        multiple: true,
        tags: true,
        options: App.state.hosts,
        //value: null,
        styles: 'form-group',
        required: false,
        unselectedText: 'select target hosts',
        idAttribute: 'id',
        textAttribute: 'hostname',
        requiredMessage: 'Selection required',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label'
      }),
      new InputView({
        label: 'New Name',
        name: 'name',
        required: false,
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: `Copy of ${this.model.name}`,
      })
    ]

    FormView.prototype.initialize.apply(this,arguments)
  },
  submit (next) {
    this.beforeSubmit()
    if (!this.valid) return

    const data = this.prepareData( assign({},this.model.serialize(),{ name: this.data.name }) )
    TaskActions.createMany(this.data.hosts, data)
    if (next) next()
    this.trigger('submit')
  },
  prepareData (data) {
    delete data.id
    delete data._id
    delete data.host
    delete data.host_id
    delete data.creation_date
    delete data.last_update
    delete data._type
    return data
  },
  focus () {
    this.query('input').focus()
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')
  }
})

module.exports = PanelButton.extend({
  initialize (options) {
    PanelButton.prototype.initialize.apply(this,arguments)
    this.tip = 'Copy Task'
    this.iconClass = 'fa fa-copy'
    this.className = 'btn btn-primary'
  },
  events: {
    click (event) {
      event.stopPropagation()

      const form = new CopyForm({ model: this.model })
      const modal = new Modalizer({
        confirmButton: 'Copy',
        buttons: true,
        title: 'Copy Task',
        bodyView: form
      })

      this.listenTo(modal,'shown',() => { form.focus() })
      this.listenTo(modal,'hidden',() => {
        form.remove()
        modal.remove()
      })
      this.listenTo(modal,'confirm',() => {
        form.submit( () => {
          modal.hide()
        })
      })

      modal.show()
    }
  }
})
