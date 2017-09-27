'use strict'

import extend from 'lodash/assign'
import Backdrop from 'components/backdrop'
import './style.css'
import roboto from './roboto_loader.gif'

module.exports = Backdrop.extend({
  template: `
    <div class="modal-backdrop fade in">
      <div class="loader-component">
        <img src="${roboto}">
        <h3 data-hook="message"></h3>
      </div>
    </div>
  `,
  props: {
    message: ['string',false,'Loading...'],
    progress: ['number',false,0],
    show_progress: ['boolean',false,false]
  },
  bindings: extend({}, Backdrop.prototype.bindings, {
    message: {
      hook: 'message'
    }
  }),
  initialize (options) {
    // default props values
    this.color = '#000'
    Backdrop.prototype.initialize.apply(this,arguments)
  },
  updateState (loader) {
    if (!loader.visible) {
      window.setTimeout(() => { // delay to hide
        this.visible = false
      }, 500)
    } else {
      this.visible = true // show inmeadiatelly
    }
    this.message = loader.message || this.message
    this.progress = loader.progress
  }
})
