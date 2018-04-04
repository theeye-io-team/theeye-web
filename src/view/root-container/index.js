'use strict'

import App from 'ampersand-app'
import View from 'ampersand-view'
import ViewSwitcher from 'ampersand-view-switcher'
import localLinks from 'local-links'

import Navbar from 'view/navbar'

const EmptyView = View.extend({
  template: `<div></div>`
})

module.exports = View.extend({
  autoRender: true,
  props: {
    title: ['string',false,'TheEye']
  },
  template: `
  	<div class="main-container">
			<nav></nav>
  	  <div data-hook="page-container"></div>
  	  <footer>
  	    <a href="/">theeye.io</a><br> Copyright © 2018 THEEYE INC
  	  </footer>
  	</div>
  `,
  initialize () {
    this.title = 'TheEye'
    View.prototype.initialize.apply(this,arguments)
  },
  updateState (state) {
    if (!state.currentPage) {
      this.pageSwitcher.set( new EmptyView() )
    } else {
      this.pageSwitcher.set(state.currentPage)
    }
  },
  events: {
    'click a[href]': function (event) {
      if (/mailto:/.test(event.delegateTarget.href) === true) return

      var localPath = localLinks.pathname(event)
      if (localPath) {
        event.stopPropagation()
        event.preventDefault()
        event.localPath = localPath
        this.trigger('click:localPath', event)
      }
    }
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
        document.title = view.pageTitle || 'TheEye'
        document.scrollTop = 0
      }
    })
  }
})
