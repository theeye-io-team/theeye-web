import App from 'ampersand-app'
import SessionActions from 'actions/session'
import config from 'config'
module.exports = () => {
  let refreshInterval

  const isPublicRoute = (pathname) => {
    return ['login','register','activate','sociallogin'].some(route => {
      let routeRegex = new RegExp(route)
      return routeRegex.test(pathname)
    })
  }

  // if has access token, should validate it first? it cannot work offline
  App.state.session.on('change:logged_in',() => {
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

  App.Router.on('route',()=>{
    if (!isPublicRoute(window.location.pathname)) {
      SessionActions.refreshAccessToken()
    }
  })

  const refreshTntervalMs = config.session.refresh_interval
  App.state.session.on('change:logged_in',() => {
    if (App.state.session.logged_in===true) {
      refreshInterval = setInterval(() => {
        SessionActions.refreshAccessToken()
      }, refreshTntervalMs)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  })
}
