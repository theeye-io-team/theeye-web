
import InputView from 'components/input-view'
import SelectView from 'components/select2-view'
import EventsSelectView from './events-select'
import EmittersSelectView from './emitters'

export default InputView.extend({
  template: `
    <div>Select Triggers</div>
  `,
  initialize (options) {
    this.initialValue = options.value
    InputView.prototype.initialize.apply(this, arguments)
  },
  props: {
    initialValue: 'any'
  },
  render () {
    const triggeredBy = this.triggeredBy = new EventsSelectView({
      label: 'Triggered by',
      name: 'triggers',
      //filterOptions: [
      //  item => {
      //    return item.emitter_id !== this.model.id
      //  }
      //],
      visible: false,
      value: this.initialValue,
    })

    const emittersSelect = this.emittersSelect = new EmittersSelectView({
      label: 'Emitters',
      name: 'emitters',
      visible: false
    })
  },
  value () {
    return this.triggeredBy.value
  },
  valid () {
    return this.triggeredBy.valid
  }
})
