import View from 'ampersand-view'
import SearchActions from 'actions/searchbox'
import App from 'ampersand-app'

module.exports = View.extend({
  autoRender: true,
  template: require('./template.hbs'),
  props: {
    inputValue: ['string',false,''],
    searchActivated: ['boolean',false,false]
  },
  bindings: {
    searchActivated: {
      type: 'toggle',
      hook: 'search-mobile-container'
    },
    inputValue: [{
      type: 'value',
      hook: 'xs-input'
    },{
      type: 'value',
      hook: 'sm-input'
    }]
  },
  initialize () {
    View.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(App.state.searchbox,'change:search',() => {
      this.updateState()
    })
  },
  events: {
    'input input': 'oninput',
    'click [data-hook=search-button-mobile]': 'onClickSearchMobile',
    'click [data-hook=endsearch-button-mobile]': 'onClickEndSearchMobile'
  },
  oninput (event) {
    SearchActions.search(event.target.value)
  },
  onClickSearchMobile (event) {
    this.searchActivated = true
  },
  onClickEndSearchMobile (event) {
    this.searchActivated = false
    this.endsearch()
  },
  render () {
    this.renderWithTemplate()
    const self = this

    // anywere keypress event focus on search
    // this event listener will remains until the application refresh
    document.addEventListener('keypress', (event) => {
      if (
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.tagName === 'INPUT'
      ) return

      const inputs = self.queryAll('input')
      inputs.forEach(input => {
        if (input.offsetParent !== null) {
          input.focus()
        }
      })
    }, false)

    document.addEventListener('keydown', (event) => {
      const inputs = self.queryAll('input')
      if (
        document.activeElement === inputs[0] ||
        document.activeElement === inputs[1]
      ) {
        if (event.keyCode == 27) {
          self.endsearch()
        }
      }
    }, false)
  },
  endsearch () {
    this.queryAll('input').forEach(input => input.value = '')
    SearchActions.clear()
  },
  // listen to app state changes and update inputValue
  updateState () {
    this.inputValue = App.state.searchbox.search
  }
})
