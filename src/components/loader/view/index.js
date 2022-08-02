
export default function (view) {
  const elem = document.createElement('div')
  elem.classList.add('view-loader')
  elem.style.position = 'absolute'
  elem.style.left = 0
  elem.style.right = 0
  elem.style.top = 0
  elem.style.bottom = 0
  elem.style.backgroundColor = '#ffffff33'
  elem.style.textAlign = 'center'


  this.start = () => {
    view.el.appendChild(elem)
  }

  this.stop = () => {
    elem.remove()
  }

  return this
}
