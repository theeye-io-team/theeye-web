import App from 'ampersand-app'
import XHR from 'lib/xhr'
import Acls from 'lib/acls'
import bootbox from 'bootbox'

export default {
  /**
   * create new token
   */
  create (data) {
    let token = new App.Models.Token.Model({})
    token.set(data)
    token.save({}, {
      success (response) {
        App.state.session.customer.tokens.add(token)
      },
      error (err) {
        bootbox.alert('Error creating integration token.')
      }
    })
  },
  fetch () {
    if (Acls.hasAccessLevel('admin')) {
      App.state.session.customer.tokens.fetch()
    }
  },
  remove (id) {
    let token = new App.Models.Token.Model({ id: id })
    token.destroy({
      success: function(){
        bootbox.alert('Integration token removed.')
        App.state.session.customer.tokens.remove( token )
      },
      error: function (err) {
        bootbox.alert('Error removing integration token.')
      }
    })
  }
  /**
   *
   * replace refresh access token
   *
   */
  //update (token) {
  //  let customer = App.state.session.customer
  //  XHR.send({
  //    url: `${App.config.api_v3_url}/customer/${customer.id}/token/${token}`,
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
  //    url: `${App.config.api_v3_url}/customer/${customer.id}/token/${token}/refresh`,
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
