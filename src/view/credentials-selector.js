import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (specs) {
    const credentials = App.state.credentials.filter(e => {
      const notIn = ['root']
      if (App.state.session.user.credential === 'manager') {
        notIn.push('admin')
      }
      return (notIn.indexOf(e.name) === -1)
    })

    this.options = credentials
    this.styles = 'form-group'
    this.name = specs.name || 'credential'
    this.required = true
    this.label = specs.label || 'Role (credential)'
    this.unselectedText = 'credential'
    this.idAttribute = 'name'
    this.textAttribute = 'name'
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'

    SelectView.prototype.initialize.apply(this, arguments)
  }
})

