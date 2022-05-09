import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (specs) {
    this.options = App.state.policies.models
    this.multiple = true
    this.tags = false
    this.label = 'Policy Selection'
    this.name = 'policies'
    this.styles = 'form-group'
    this.unselectedText = 'select a policy'
    this.idAttribute = 'id'
    this.textAttribute = 'name'
    this.allowCreateTags = false

    SelectView.prototype.initialize.apply(this, arguments)
  },
  derived: {
    value: {
      deps: ['inputValue','multiple'],
      fn: function () {
        // this is set with $select2 data array value
        // it contains id and text attributes
        let input = this.inputValue
        if (this.multiple) {
          if (!input) return []
          if (Array.isArray(input)&&input.length===0) return []
          return input.map(e => App.state.policies.get(e.id).serialize())
        } else {
          if (!input) return null
          if (Array.isArray(input)&&input.length===0) return null
          let values = input.map(e => App.state.policies.get(e.id).serialize())
          return values[0]
        }
      }
    }
  }
})
