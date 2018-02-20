import App from 'ampersand-app'
import templates from 'actions/hostgroup'
import HandleMe from 'lib/handle-me'

module.exports = () => {

  const me = new HandleMe()

  me.initialize((err) => {
    App.extend({ me: me })
    initialize(me)
  })

}

const initialize = (me) => {
  if (!me.settings.experimental) return

  if (me.settings.experimental.enabled===true) {
    console.warn('experimental features enabled!')

    window._App = App

    App.extend({
      experimental: { templates }
    })
  }
}
