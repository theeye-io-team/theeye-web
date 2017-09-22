'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import ViewSwitcher from 'ampersand-view-switcher'
import localLinks from 'local-links'

import Navbar from 'view/navbar'

module.exports = View.extend({
  autoRender: true,
  props: {
    title: ['string',false,'The Eye']
  },
  template: `
  	<div class="main-container">
			<nav></nav>
  	  <div data-hook="page-container"></div>
  	  <footer>
  	    <a href="/">theeye.io</a> - Beta Release <br> Copyright © 2014-2017 Theeye Inc
  	  </footer>
  	</div>
  `,
  initialize () {
    this.title = 'The Eye'
    this.listenTo(App.state,'change:currentPage',this.onSwitchPage)
  },
  events: {
    'click a[href]': function (event) {
      if (/mailto:/.test(event.delegateTarget.href) === true) return

      var localPath = localLinks.pathname(event)
      if (localPath) {
        event.stopPropagation()
        event.preventDefault()
        App.navigate(localPath)
      }
    }
  },
  onSwitchPage () {
    // tell the view switcher to render the new one
    this.pageSwitcher.set(App.state.currentPage)
  },
  render () {
    // main renderer
    this.renderWithTemplate(this)

    this.registerSubview(
      new Navbar({ el: this.query('nav') })
    )

    // init and configure our page switcher
    this.pageSwitcher = new ViewSwitcher({
      el: this.queryByHook('page-container'),
      show (view) {
        document.title = view.pageTitle || 'Interactar'
        document.scrollTop = 0
      }
    })
  }
})
