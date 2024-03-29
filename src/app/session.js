import App from 'ampersand-app'
import SessionActions from 'actions/session'
import config from 'config'

export default () => {
  let refreshInterval

  const refreshIntervalMs = config.session.refresh_interval

  const isPublicRoute = (pathname) => {
    return App.Router.publicRoutes.some(route => {
      let routeRegex = new RegExp(route)
      return routeRegex.test(pathname)
    })
  }

  App.listenToAndRun(App.state.session, 'change:logged_in', () => {
    let loggedIn = App.state.session.logged_in
    if (loggedIn === undefined) { return } // wait until it is set

    if (!App.Router.history.started()) {
      App.Router.history.start({
        pushState: (window.origin !== 'null')
      })
    }

    if (!isPublicRoute(window.location.pathname)) {
      /**
       * two scenarios:
       * 1. a user is closing the session and is no longer logged in
       * 2. a user has landed in the /logout page and has no session
       */
      if (loggedIn === false) {
        App.actions.session.logoutNavigate()
      } else {
        if (window.origin === 'null') {
          // redirect to dashboard only if pushState is not supported
          App.Router.redirectTo('dashboard', { replace: true })
        }
      }
    } else { // is public route
      if (loggedIn === true) {
        App.Router.redirectTo('dashboard', { replace: true })
      }
    }
  })

  App.listenToAndRun(App.state.session, 'change:logged_in', () => {
    if (App.state.session.logged_in === true) {
      // set next refresh interval
      refreshInterval = setInterval(() => {
        App.actions.session.refreshAccessToken()
      }, refreshIntervalMs)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  })
}
