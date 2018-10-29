import View from 'ampersand-view'
import SearchActions from 'actions/searchbox'
import App from 'ampersand-app'

import './styles.less'

module.exports = View.extend({
  autoRender: true,
  template: require('./template.hbs'),
  props: {
    inputValue: ['string', false, ''],
    showMobileInput: ['boolean', false, false],
    showDeleteButton: ['boolean', false, false]
  },
  bindings: {
    showMobileInput: {
      type: 'toggle',
      hook: 'search-mobile-container'
    },
    showDeleteButton: {
      type: 'toggle',
      hook: 'endsearch-icon'
    },
    inputValue: [{
      type: 'value',
      hook: 'xs-input'
    }, {
      type: 'value',
      hook: 'sm-input'
    }]
  },
  initialize () {
    View.prototype.initialize.apply(this, arguments)

    this.listenToAndRun(App.state.searchbox, 'change:search', () => {
      this.updateState()
    })
  },
  events: {
    'input input': 'oninput',
    'click [data-hook=search-button-mobile]': 'onClickSearchMobile',
    'click [data-hook=endsearch-button-mobile]': 'onClickEndSearchMobile',
    'click [data-hook=endsearch-icon]': 'onClickEndSearchMobile'
  },
  oninput (event) {
    this.showDeleteButton = event.target.value.length > 0
    SearchActions.search(event.target.value)
  },
  onClickSearchMobile (event) {
    this.showMobileInput = true
  },
  onClickEndSearchMobile (event) {
    this.showMobileInput = false
    this.showDeleteButton = false
    this.endsearch()
  },
  render () {
    this.renderWithTemplate()
    const self = this
    const inputs = self.queryAll('input')

    this.listenToAndRun(App.state.searchbox, 'change:matches', () => {
      this.closeAutocompleteLists()
      this.autocomplete(inputs[0])
      this.autocomplete(inputs[1])
    })

    document.addEventListener('keydown', (event) => {
      if (
        document.activeElement === inputs[0] ||
        document.activeElement === inputs[1]
      ) {
        if (event.keyCode === 27) {
          self.endsearch()
        }
      }
    }, false)

    document.addEventListener('click', function (e) {
      self.closeAutocompleteLists()
    })
  },
  endsearch () {
    this.queryAll('input').forEach(input => (input.value = ''))
    SearchActions.clear()
  },
  // listen to app state changes and update inputValue
  updateState () {
    this.inputValue = App.state.searchbox.search
    this.showDeleteButton = this.inputValue.length > 0
  },
  closeAutocompleteLists () {
    var x = document.getElementsByClassName('autocomplete-items')
    for (var i = 0; i < x.length; i++) {
      x[i].parentNode.removeChild(x[i])
    }
  },
  autocomplete (searchInput) {
    const self = this
    let val = searchInput.value

    if (!val) { return false }

    let a = document.createElement('DIV')
    a.setAttribute('id', searchInput.id + 'autocomplete-list')
    a.setAttribute('class', 'autocomplete-items')
    searchInput.parentNode.appendChild(a)
    for (let i = 0; i < App.state.searchbox.matches.length; i++) {
      if (App.state.searchbox.matches[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
        let b = document.createElement('DIV')
        b.innerHTML = '<strong>' + App.state.searchbox.matches[i].substr(0, val.length) + '</strong>'
        b.innerHTML += App.state.searchbox.matches[i].substr(val.length)
        b.innerHTML += '<input type="hidden" value="' + App.state.searchbox.matches[i] + '">'
        b.addEventListener('click', function (e) {
          searchInput.value = b.getElementsByTagName('input')[0].value
          SearchActions.search(searchInput.value)
          self.closeAutocompleteLists()
        })
        a.appendChild(b)
      }
    }
  }
})
