import jQuery from 'jquery'
import uriFragment from 'lib/uri-fragment'
import './searchbox.css'

(function ($) {
  $.searchbox = function () {
    var $emitter = $({})
    var lastTimer

    var searchItemSelector = '.js-searchable-item'
    var $searchItems = $(searchItemSelector)
    var $searchBox = $('.js-searchable-box')
    var $searchBtn = $searchBox.find('button.search')
    var $searchCleanBtn = $searchBox.find('button.clean')
    var $searchInput = $searchBox.find('input')

    $searchInput.on('input', function (event) {
      lastTimer && clearTimeout(lastTimer)
      if ($searchInput.val() !== '') {
        $searchCleanBtn.addClass('active')
        $emitter.trigger('search:start')
        $emitter.searching = true
      } else {
        resetSearch()
      }
    })

    function resetSearch () {
      $searchCleanBtn.removeClass('active')
      $emitter.trigger('search:done')
      $emitter.trigger('search:empty')
      $emitter.searching = false
      window.location.hash = ''
    }

    $searchInput.on('keypress', function (event) {
      if (event.which === 13) { // Enter key = keycode 13
        $searchBtn.trigger('click')
        return false
      }
    })

    $searchInput.on('keyup', function (event) {
      if (event.keyCode === 27) {
        $searchInput.val('')
        $searchBtn.trigger('click')
        // resetSearch();
      } else {
        var input = $searchInput.val()
        var chars = input.length
        if (chars >= 3) {
          $searchBtn.trigger('click')
        } else if (chars === 0) {
          $searchBtn.trigger('click')
        }
        window.location.hash = 'search=' + input
      }
    })

    $searchCleanBtn.on('click', function (event) {
      event.preventDefault()
      event.stopPropagation()
      // console.log('clean search');

      lastTimer && clearTimeout(lastTimer)
      $searchInput.val('')
      $searchBtn.trigger('click')
    })

    $searchBtn.on('click', function (event) {
      event.preventDefault()
      event.stopPropagation()

      lastTimer && clearTimeout(lastTimer)

      // early cut if no value to match
      if (!$searchInput.val()) {
        $searchInput.trigger('input')
        $searchItems.slideDown(200)
        return
      }

      var waitForIt = false
      // console.log('searching');
      var search = $searchInput.val().toLowerCase()
      var pattern = new RegExp(search)

      for (var i = 0; i < $searchItems.length; i++) {
        var $item = $($searchItems[i])
        var tags = $item.data('tags')
        if (!tags) return

        tags = tags.toLowerCase()

        if (!pattern.test(tags)) {
          if ($item.is(':visible')) {
            $item.slideUp(200)
            waitForIt = true
          }
        } else {
          // console.log('pattern matches on tags %s', tags);
          if (!$item.is(':visible')) {
            $item.slideDown(200)
            waitForIt = true
          }
        }
      }

      // kludge!
      // if there's been any slide up/down, wait 10ms extra (200ms slide)
      // and trigger search:done
      if (waitForIt) {
        lastTimer = setTimeout(function () {
          $emitter.trigger({
            type: 'search:done',
            matches: $(searchItemSelector + ':visible').length
          })
        }, 210)
      }
    })

    $emitter.input = $searchInput

    var existingSearch = uriFragment.get()
    if (existingSearch.search) {
      $searchInput.val(existingSearch.search)
      $searchBtn.trigger('click')
    }
    return $emitter
  }
}(jQuery))

window.$searchbox = jQuery.searchbox()
