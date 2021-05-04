import View from 'ampersand-view'
import App from 'ampersand-app'

import './styles.less'

export default View.extend({
  template: `
    <div>
      <span data-hook="search-button-mobile" class="hidden-sm eyemenu-search-icon">
        <i class="fa fa-search" aria-hidden="true"></i>
      </span>
      <div data-hook="search-mobile-container" class="eyemenu-search-panel-mobile hidden-sm">
        <!--<i class="fa fa-times eyemenu-search-panel-clear" aria-hidden="true"></i>-->
        <i data-hook="endsearch-button-mobile" class="fa fa-arrow-left" aria-hidden="true"></i>
        <input autocomplete="off" id="sm-input" data-hook="sm-input" placeholder="Search">
        <i data-hook="endsearch-icon" class="fa fa-times-circle" aria-hidden="true"></i>
      </div>
      <div class="eyemenu-search-panel-desktop hidden-xs">
        <!--<i class="fa fa-times eyemenu-search-panel-clear" aria-hidden="true"></i>-->
        <i class="fa fa-search" aria-hidden="true"></i>
        <input autocomplete="off" id="xs-input" data-hook="xs-input" placeholder="Search">
        <i data-hook="endsearch-icon" class="fa fa-times-circle" aria-hidden="true"></i>
      </div>
    </div>
  `,
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
    'keypress input': 'onkeypress',
    'click [data-hook=search-button-mobile]': 'onClickSearchMobile',
    'click [data-hook=endsearch-button-mobile]': 'onClickEndSearchMobile',
    'click [data-hook=endsearch-icon]': 'onClickEndSearchMobile'
  },
  oninput (event) {
    this.showDeleteButton = event.target.value.length > 0
    if (event.target.value.length === 0) {
      this.endsearch()
    } else {
      App.actions.searchbox.clear()
      App.actions.searchbox.findMatches(event.target.value)
    }
  },
  onkeypress (event) {
    if (event.keyCode === 13) { // ENTER KEY
      App.actions.searchbox.search(event.target.value)
      this.closeAutocompleteLists()
      App.actions.searchbox.clearMatches()
      return
    }
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
      App.actions.searchbox.clearMatches()
    })
  },
  endsearch () {
    this.queryAll('input').forEach(input => (input.value = ''))
    App.actions.searchbox.clear()
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
          App.actions.searchbox.search(searchInput.value)
          self.closeAutocompleteLists()
        })
        a.appendChild(b)
      }
    }
  }
})
