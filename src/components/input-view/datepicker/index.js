import View from 'ampersand-view'
import InputView from '../index'
import Flatpickr from 'flatpickr'
// import FlatpickrI18n from './lang/es'
import 'flatpickr/dist/flatpickr.css'

const ClearIcon = View.extend({
  template: `<i class="fa fa-remove" style="right:22px;top:24px;position:absolute;"></i>`,
  props: {
    visible: ['boolean', false, false]
  },
  bindings: {
    visible: {
      type: 'toggle'
    }
  },
  events: {
    click: function (e) {
      this.trigger('click')
    }
  },
  show () {
    this.visible = true
  },
  hide () {
    this.visible = false
  }
})

/**
 *
 * NOTE: Use AmpersandInputView as a Template, most of the base methods has been replaced.
 *
 * Why? The component input element (this.input) is being handled and changed by FlatPickr,
 * so it cannot be also being modified by AmpersandInputView, because it
 * produces complicated secuences of changes. it works as it is now.
 *
 * Do not trust/use this.input associated logic nor AmpersandInputView base methods.
 * in most of the cases the parent methods(base behaviour) has been rewrited
 *
 */
module.exports = InputView.extend({
  props: {
    selector: ['string', false, 'input']
  },
  initialize (options) {
    InputView.prototype.initialize.apply(this, arguments)
    this.options = options || {}
    this.options.defaultDate = options.value
    this.options.utc = true
    this.shouldValidate = false
  },
  render () {
    this.renderWithTemplate(this)
    const input = this.query(this.selector)
    const options = this.options
    options.onChange = (e) => this.onDateChange(e)
    options.onReady = (e) => this.onDateChange(e)

    // Flatpickr.localize(FlatpickrI18n.es)
    this.flatpickr = new Flatpickr(input, this.options)
    this.clearBtn = new ClearIcon()

    this.listenTo(this.clearBtn, 'click', this.onClickClear)
    this.listenTo(this, 'change:inputValue', this.onInputValueChanged)

    this.renderSubview(this.clearBtn, this.queryByHook('input-container'))
    this.onDateChange()
  },
  onInputValueChanged (event) {
    if (this.inputValue.length > 0) {
      this.clearBtn.show()
    } else {
      this.clearBtn.hide()
    }
  },
  onClickClear (event) {
    this.clear()
  },
  onDateChange (event) {
    if (!this.flatpickr) return // Flatpickr trigger ready before returning the instance

    this.shouldValidate = true
    this.setValue(this.flatpickr.selectedDates)
    this.handleChange()
  },
  beforeSubmit () {
    this.shouldValidate = true
    this.setValue(this.flatpickr.selectedDates)
    this.runTests()
  },
  clear () {
    this.flatpickr.clear()
  },
  setValue (value) {
    this.inputValue = value
    return
  },
  remove () {
    // InputView.prototype.remove.apply(this)
    this.clearBtn.remove()
    this.flatpickr.destroy()
  }
})
