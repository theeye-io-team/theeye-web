import App from 'ampersand-app'
import DynamicForm from 'components/dynamic-form'
import FIELD from 'constants/field'

module.exports = (options) => {

  const fieldsDefinitions = []

  options.fieldsDefinitions.forEach(field => {
    if (field.type === FIELD.TYPE_REMOTE_OPTIONS) {
      let url = field.endpoint_url

      if (/%THEEYE_USER_EMAIL%/.test(url)) {
        let email = encodeURIComponent(App.state.session.user.email)
        url = url.replace('%THEEYE_USER_EMAIL%', email)
      }

      fieldsDefinitions.push(Object.assign({}, field.serialize(), {endpoint_url: url}))
    } else {
      fieldsDefinitions.push(field)
    }
  })

  return new DynamicForm( Object.assign({}, options, {fieldsDefinitions}) )
}
