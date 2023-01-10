import FormView from 'ampersand-form-view'
import InputView from 'components/input-view'
import CheckboxView from 'components/checkbox-view'
//import isURL from 'validator/lib/isURL'
import HelpIcon from 'components/help-icon'
import HelpTexts from 'language/help'

export default FormView.extend({
  initialize: function (options) {
    this.fields = [
      new CheckboxView({
        name: 'enabled',
        label: 'Enable',
        value: this.model.enabled,
        required: false,
      }),
      new InputView({
        name: 'url',
        label: 'URL',
        placeholder: 'https/https url',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.url,
        required: true,
      }),
      new InputView({
        name: 'label',
        label: 'Label',
        placeholder: 'A label to identify this',
        invalidClass: 'text-danger',
        validityClassSelector: '.control-label',
        value: this.model.label,
        required: false,
      }),
      new CheckboxView({
        name: 'menu',
        label: 'Menu Shortcut',
        value: this.model.menu,
        required: false,
      }),
      new InputView({
        name: 'icon',
        label: 'Fontawesome Class',
        value: this.model.icon,
        required: false,
      })
    ]

    FormView.prototype.initialize.apply(this, arguments)
  },
  addHelpIcon (field) {
    const view = this._fieldViews[field]
    if (!view) return

    const text = HelpTexts.integrations[this.model.name]
    if (!text) { return }

    view.renderSubview(
      new HelpIcon({ text: text[field] }),
      view.query('label')
    )
  },
  render () {
    FormView.prototype.render.apply(this, arguments)
    this.query('form').classList.add('form-horizontal')

    this.addHelpIcon('url')
    this.addHelpIcon('enabled')
  },
  focus () {
    this.query('input[name=url]').focus()
  }
})
