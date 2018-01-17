import View from 'ampersand-view'
import './style.css'

module.exports = View.extend({
  template: `
    <span class="simple-switch">
      <input type="checkbox" />
      <label>&nbsp;</label>
    </span>
  `,
  props: {
    value: ['boolean', true, false]
  },
  bindings: {
    //value: {
    //  type: 'booleanAttribute',
    //  selector: 'input',
    //  name: 'checked'
    //},
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
      this.toggle('value')
    }
  },
  render () {
    this.renderWithTemplate(this)
    if (this.value===true) {
      this.query('input').setAttribute('checked', true)
    }
  }
})
