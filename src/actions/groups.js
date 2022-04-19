import App from 'ampersand-app'
import XHR from 'lib/xhr'

export default {
  getGroups () {
    XHR.send({
      method: 'get',
      url: `${App.config.api_url}/group/`,
      withCredentials: true,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (groups, xhr) {
        console.log(groups)
      }
    })
  },
  create (data) {
    XHR.send({
      method: 'post',
      url: `${App.config.api_url}/group/`,
      withCredentials: true,
      jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
    })
  },
  menu: {
    hide () {
      App.state.groupsMenu.visible = false
    },
    show () {
      let state = App.state.groupsMenu
      if (!state.current_tab) {
        state.current_tab = state.default_tab
      }
      state.visible = true 
    },
    toggle () {
      App.state.groupsMenu.toggle('visible')
    },
    toggleTab (tabName) {
      App.state.groupsMenu.current_tab = tabName
    }
  }
}
