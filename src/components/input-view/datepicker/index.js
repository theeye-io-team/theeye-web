import View from 'ampersand-view'
import InputView from '../index'
import Flatpickr from 'flatpickr'
// import FlatpickrI18n from './lang/es'
import 'flatpickr/dist/flatpickr.css'

const isValidDate = function (date) {
  return date instanceof Date && !isNaN(date)
}

const ClearIcon = View.extend({
  template: `<i class="fa fa-remove" style="right:22px;top:10px;position:absolute;"></i>`,
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
    this.options = options || {}
    this.options.defaultDate = options.value
    this.options.utc = true

    InputView.prototype.initialize.apply(this, arguments)
  },
  render () {
    this.renderWithTemplate(this)
    const input = this.query(this.selector)
    const options = this.options
    options.onChange = [
      (selectedDates, dateStr, instance) => {
        this.onDateChange()
      }
    ]
    //options.onReady = [
    //  (selectedDates, dateStr, instance) => {
    //    this.onDateChange()
    //  }
    //]

    // Flatpickr.localize(FlatpickrI18n.es)
    this.flatpickr = new Flatpickr(input, this.options)
    this.clearBtn = new ClearIcon()

    this.listenTo(this.clearBtn, 'click', this.onClickClear)
    this.listenTo(this, 'change:inputValue', this.onInputValueChanged)

    this.renderSubview(this.clearBtn, this.queryByHook('input-container'))
    //this.onDateChange()
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
  onDateChange () {
    if (!this.flatpickr) return // Flatpickr trigger ready before returning the instance
    //this.shouldValidate = true
    this.setValue(this.flatpickr.selectedDates)
    this.handleChange()
  },
  beforeSubmit () {
    this.setValue(this.flatpickr.selectedDates)
    this.shouldValidate = true
    this.runTests()
  },
  clear () {
    this.flatpickr.clear()
  },
  setValue (value, skipValidation) {
    if (!this.flatpickr) return // Flatpickr trigger ready before returning the instance

    let date = new Date(value)

    if (isValidDate(date)) {
      this.flatpickr.setDate(date)
    } else {
      return
    }

    this.inputValue = value

    this.trigger('change:inputValue') // force change. value is always the same array

    if (!skipValidation && !this.getErrorMessage()) {
      this.shouldValidate = true;
    } else if (skipValidation) {
      this.shouldValidate = false;
    }
    return
  },
  remove () {
    // InputView.prototype.remove.apply(this)
    this.clearBtn.remove()
    this.flatpickr.destroy()
  }
})
