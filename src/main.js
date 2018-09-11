import Loader from 'components/loader/progress-bar'

const loader = new Loader({ screenblock: true })
loader.visible = true

window.addEventListener('load', () => {
  require.ensure(['ampersand-app', './app'], () => {
    const App = require('ampersand-app')
    // this extend is here so when state is
    // initialized it can find the loader somewhere
    App.extend({ loader: loader })
    require('./app')
  }, 'app')
})
