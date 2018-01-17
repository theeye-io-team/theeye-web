import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// import State from 'ampersand-state'
import Backdrop from './simple-backdrop'
import './style.css'

export default function (options) {
  this._visible = false
  this.screenblock = options.screenblock
  this.backdrop = new Backdrop()
  this.nprogress = NProgress.configure({
    showSpinner: false
  })

  this.step = function () {
    if (!this._visible) {
      this._visible = true
    // } else {
    //   this.nprogress.inc()
    }
    this.nprogress.inc()
  }

  Object.defineProperty(this, 'visible', {
    get: function () { return this._visible },
    set: function (value) {
      if (!value) {
        this._visible = false
        this.backdrop.hide()
        this.nprogress.done()
      } else {
        this._visible = true
        if (this.screenblock) {
          this.backdrop.show()
        }
        this.nprogress.start()
      }
    }
  })
}
