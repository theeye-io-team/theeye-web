import View from 'ampersand-view'
import InputView from '../index'
import Flatpickr from 'flatpickr'
import FlatpickrI18n from 'flatpickr/src/l10n/es'
import extend from 'lodash/extend'

const ClearIcon = View.extend({
  template: `
    <i class="fa fa-remove" style="right: 20px; position: relative;"></i>
  `,
  props: {
    visible: ['boolean',false,false]
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

module.exports = InputView.extend({
  props: {
    selector: ['string', false, 'input']
  },
  initialize (options) {
    InputView.prototype.initialize.apply(this, arguments)
    this.options = options || {}
    this.options.defaultDate = options.value
  },
  render () {
    //InputView.prototype.render.apply(this)
    this.renderWithTemplate(this)
    const input = this.query(this.selector)

    const options = this.options
    options.onChange = (e) => this.onDateChange(e)
    options.onReady = (e) => this.onDateChange(e)

    Flatpickr.localize(FlatpickrI18n.es);
    this.flatpickr = new Flatpickr(input, this.options)

    this.clearBtn = new ClearIcon()
    this.listenTo(this.clearBtn,'click',this.onClickClear)
    this.listenTo(this,'change:inputValue',this.onInputValueChanged)

    this.renderSubview(this.clearBtn, this.el)
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
    this.query('input').value = ''
    this.setValue([])
    this.handleChange()
  },
  onDateChange (event) {
    if (!this.flatpickr) return // Flatpickr trigger ready before returning the instance

    this.shouldValidate = true
    this.setValue(this.flatpickr.selectedDates)
    this.handleChange()
  },
  clear () {
    this.query(this.selector).value = ''
    this.inputValue = ''
  },
  setValue (value) {
    this.inputValue = value
    return
  },
  remove () {
    //InputView.prototype.remove.apply(this)
    this.clearBtn.remove()
    this.flatpickr.destroy()
  }
})
