import App from 'ampersand-app'
import SelectView from 'components/select2-view'

export default SelectView.extend({
  initialize (specs) {
    //const roles = App.state.roles.filter(e => {
    //  const notIn = ['root']
    //  if (App.state.session.user.roles.indexOf('manager') !== -1) {
    //    notIn.push('admin')
    //  }
    //  return (notIn.indexOf(e.name) === -1)
    //})
    const roles = App.state.roles

    this.options = roles
    this.styles = 'form-group'
    this.name = specs.name || 'roles'
    this.required = true
    this.label = specs.label || 'Roles (credential)'
    this.unselectedText = 'select the roles'
    this.idAttribute = 'name'
    this.textAttribute = 'name'
    this.invalidClass = 'text-danger'
    this.validityClassSelector = '.control-label'

    SelectView.prototype.initialize.apply(this, arguments)
  }
})
