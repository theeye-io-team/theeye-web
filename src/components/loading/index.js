import bootbox from 'bootbox'
const spinnerSvg = require('./ripple.svg')
const spinnerContent = `<div class="text-center"><img src="${spinnerSvg}" /></div>`

const waiting = function () {
  return bootbox.dialog({ message: spinnerContent })
}

export default waiting
