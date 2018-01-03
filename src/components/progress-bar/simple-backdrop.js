import svg from './ripple.svg'
const SimpleBackdrop = function () {
  this.elem = document.createElement('div')
  this._visible = false
  // styles copied from 'modal-backdrop fade in'
  // without the fade animation
  const styles = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // opacity: 0.75,
    'z-index': 1040,
    'background-color': 'rgba(0, 0, 0, 0.5)',
    'text-align': 'center'
  }
  Object.keys(styles).forEach(prop => {
    this.elem.style[prop] = styles[prop]
  })
  Object.defineProperty(this, 'visible', {
    get: function () { return this._visible },
    set: function (value) {
      if (value && this._visible) return this
      if (!value) {
        this.hide()
        this._visible = false
      } else {
        this.show()
        this._visible = true
      }
    }
  })
  const svgElem = document.createElement('img')
  svgElem.style['margin-top'] = '-35px'
  svgElem.style['margin-left'] = '-35px'
  svgElem.style['width'] = '70px'
  svgElem.style['top'] = '50%'
  svgElem.style['position'] = 'absolute'
  svgElem.style['margin-top'] = '-35px'
  svgElem.src = svg
  this.elem.append(svgElem)
}

SimpleBackdrop.prototype.show = function () {
  document.body.append(this.elem)
  return this
}
SimpleBackdrop.prototype.hide = function () {
  try {
    document.body.removeChild(this.elem)
  } catch (e) {}
  return this
}

export default SimpleBackdrop
