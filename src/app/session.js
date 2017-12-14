import App from 'ampersand-app'
import SessionActions from 'actions/session'
import config from 'config'

module.exports = () => {
  let refreshInterval

  const isPublicRoute = (pathname) => {
    return ['login','register','activate','sociallogin','passwordreset'].some(route => {
      let routeRegex = new RegExp(route)
      return routeRegex.test(pathname)
    })
  }

  const isLogginOut = (pathname) => {
    return /logout/.test(pathname) === true
  }

  App.listenToAndRun(App.state.session,'change:logged_in',() => {
    let logged_in = App.state.session.logged_in
    if (logged_in === undefined) return // wait until it is set

    if (!App.Router.history.started()) {
      App.Router.history.start({ pushState: (document.origin!=='null') })
    }

    let publicRoute = isPublicRoute(window.location.pathname)
    if (!publicRoute) {
      if (!logged_in) {
        App.Router.redirectTo('login',{replace: true})
      } else {
        if (document.origin=='null') {
          // redirect to dashboard only if pushState is not supported
          App.Router.redirectTo('dashboard',{replace: true})
        }
      }
    } else {
      if (logged_in) {
        App.Router.redirectTo('dashboard',{replace: true})
      }
    }
    // else {
    //  do nothing
    //}
  })

  const refreshIntervalMs = config.session.refresh_interval
  App.listenToAndRun(App.state.session,'change:logged_in',() => {
    if (App.state.session.logged_in===true) {
      refreshInterval = setInterval(() => {
        SessionActions.refreshAccessToken()
      }, refreshIntervalMs)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  })

  App.Router.on('route',()=>{
    if (App.state.session.logged_in===true) {
      let path = window.location.pathname
      if (!isPublicRoute(path) && !isLogginOut(path)) {
        SessionActions.refreshAccessToken()
      }
    }
  })
}
