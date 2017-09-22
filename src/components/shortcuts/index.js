import View from 'ampersand-view'
import Modalizer from 'components/modalizer'

const HelpView = View.extend({
  template: `<div>Help</div>`
})

var ctrlpress = false

module.exports = View.extend({
  autoRender: true,
  template: `<div></div>`,
	render () {
		this.renderWithTemplate(this)

		const help = new HelpView()
		const modal = new Modalizer({
			buttons: false,
			title: 'Help',
			bodyView: help
		})
		//this.listenTo(modal,'shown',function(){
		//})
		this.listenTo(modal,'hidden',function(){
			help.remove()
			modal.remove()
		})

    document.onkeydown = function (e) {
      var key = e.keyCode ? e.keyCode : e.which
      if (key === 113 && ctrlpress) {
      }
      if (key === 17) {
        ctrlpress = true
      }
      console.log(key)
    }

    document.onkeyup = function (e) {
      var key = e.keyCode ? e.keyCode : e.which
      if (key === 113 && ctrlpress) {
      }
      if (key === 17) {
        ctrlpress = true
      }
      console.log(key)
    }
	}
})
