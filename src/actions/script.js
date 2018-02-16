import App from 'ampersand-app'
import XHR from 'lib/xhr'
const config = require('config')
import bootbox from 'bootbox'

module.exports = {
  getExampleScript(extension) {
    App.state.loader.visible = true
    XHR.send({
      method: 'get',
      url: `${config.app_url}/script/example/${extension}`,
      done: (response) => {
        App.state.loader.visible = false
        if (!response) {
          bootbox.alert('Example not found.')
        } else {
          App.state.editor.value = response
          App.state.editor.trigger('change:value')
        }
      },
      fail: (err, xhr) => {
        App.state.loader.visible = false
        App.state.editor.value = ''
        App.state.editor.trigger('change:value')
        if(xhr.status==404)
          bootbox.alert('Example not found. Please provide a valid filename extension.')
        else {
          bootbox.alert('Example not found.')
        }
      }
    })
  }
}
