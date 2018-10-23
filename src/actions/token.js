import App from 'ampersand-app'
import XHR from 'lib/xhr'
import config from 'config'
import Acls from 'lib/acls'

module.exports = {
  /**
   * create new token
   */
  create (data) {
    let customer = App.state.session.customer
    XHR.send({
      url: `${config.api_v3_url}/customer/${customer.id}/token`,
      method: 'post',
      //jsonData: data,
      headers: {
        Accept: 'application/json;charset=UTF-8'
      },
      done (token, xhr) {
        if (xhr.status == 200) {
          App.state.session.customer.tokens.add(token)
        }
      },
      fail (err, xhr) {
      }
    })
  },
  fetch () {
    if (Acls.hasAccessLevel('admin')) {
      App.state.session.customer.tokens.fetch()
    }
  }
  //remove (token) {
  //  let customer = App.state.session.customer
  //  XHR.send({
  //    url: `${config.api_v3_url}/customer/${customer.id}/token/${token}`,
  //    method: 'put',
  //    headers: {
  //      Accept: 'application/json;charset=UTF-8'
  //    },
  //    done (response, xhr) {
  //      if (xhr.status == 200) {
  //      }
  //    },
  //    fail (err, xhr) {
  //    }
  //  })
  //},
  /**
   *
   * replace refresh access token
   *
   */
  //update (token) {
  //  let customer = App.state.session.customer
  //  XHR.send({
  //    url: `${config.api_v3_url}/customer/${customer.id}/token/${token}`,
  //    method: 'patch',
  //    headers: {
  //      Accept: 'application/json;charset=UTF-8'
  //    },
  //    done (response, xhr) {
  //      if (xhr.status == 200) {
  //      }
  //    },
  //    fail (err, xhr) {
  //    }
  //  })
  //},
  //refresh (token) {
  //  let customer = App.state.session.customer
  //  XHR.send({
  //    url: `${config.api_v3_url}/customer/${customer.id}/token/${token}/refresh`,
  //    method: 'put',
  //    headers: {
  //      Accept: 'application/json;charset=UTF-8'
  //    },
  //    done (response, xhr) {
  //      if (xhr.status == 200) {
  //      }
  //    },
  //    fail (err, xhr) {
  //    }
  //  })
  //},
}
