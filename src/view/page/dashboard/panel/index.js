'use strict'

import App from 'ampersand-app'
import BaseView from 'view/base-view'
import html2dom from 'lib/html2dom'
/**
 *
 * Backbone Views
 *
 *
 * add custom panels on the fly.
 * by default there are two panels, one for monitors and the other for
 * tasks previuosly created and redered in the template.
 * with this , we can add another one
 *
 */
module.exports = BaseView.extend({
  template: require('./panel.hbs'),
  props: {
    col_class: 'string',
    title: 'string',
    name: 'string'
  },
  render () {
    this.renderWithTemplate()

    const customer = App.state.session.customer

    var container = this.queryByHook('panel-container')
    //container.appendChild( $( this.model.config.kibana )[0] )
    container.appendChild( html2dom(customer.config.kibana) )
  }
})
