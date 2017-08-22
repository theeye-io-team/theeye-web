
module.exports = function (html) {

  const el = document.createElement('div')

  el.innerHTML = html

  return el.firstChild

}
