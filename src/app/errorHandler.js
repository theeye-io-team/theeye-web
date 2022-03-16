import App from 'ampersand-app'
import XHR from 'lib/xhr'

export default () => {

  App.errors = []
  window.onerror = (msg, url, lineNo, columnNo, error) => {
    console.error('unhandled error')
    const err = { msg, url, lineNo, columnNo, error }
    App.errors.push(err)
  }

  App.listenTo(XHR, 'error', (err) => {
    App.errors.push(err)
  })

}
