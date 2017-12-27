import View from 'ampersand-view'
import './style.css'

module.exports = View.extend({
  template: `
    <span class="simple-switch">
      <input type="checkbox" />
      <label></label>
    </span>`,
  props: {
    initialValue: ['boolean', true, false],
    onChange: ['any', true, function () {}]
  },
  bindings: {
    initialValue: {
      type: 'booleanAttribute',
      selector: 'input',
      name: 'checked'
    },
    cid: [
      {
        type: 'attribute',
        name: 'id',
        selector: 'input'
      },
      {
        type: 'attribute',
        name: 'for',
        selector: 'label'
      }
    ]
  },
  events: {
    'change input': function (event) {
      this.toggle('initialValue')
    }
  },
  initialize () {
    window.aaa = this
    this.onChange = this.onChange.bind(this)
    this.on('change:initialValue', this.onChange)
  },
  render () {
    this.renderWithTemplate(this)
    if (this.initialValue) {
      this.query('input').setAttribute('checked', true)
    }
  }
})
