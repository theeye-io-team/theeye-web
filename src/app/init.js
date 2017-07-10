require('bootstrap')
import $ from 'jquery'
import 'block-ui'
import 'styles/custom.css'

/*
  Fuzzy global declarations and behaviors
*/

window.setCustomer = function (customer) {
  $.blockUI()
  $.post('/setcustomer/' + customer, {}, function (data, status, jqxhr) {
    if (status !== 'success' || jqxhr.status !== 200) {
      window.alert('Error setting customer!')
    } else {
      window.location.reload()
    }
  }, 'json')
}

window.$ = $

window.alert = function (msg, title, cbk) {
  var $alert = $('#alert')

  $alert.find('.modal-body').html(msg)
  if (title) {
    $alert.find('.modal-title').html(title)
  }
  $('#alert').one('hidden.bs.modal', function () {
    if (cbk) cbk()
    // do something…
  })
  $('#alert').modal('show')
}

window.is_touch_device = function () {
  return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0))
}

// global variable for visitor details
// just checking if is touch device for now
window.visitor = {}
window.visitor.isTouch = window.is_touch_device()

$('.nav li a').each(function (index, element) {
  $(this).removeClass('active')
  if (element.href === document.URL) {
    var $parent = $(this).parent()
    if (!$parent.hasClass('active')) {
      $parent.addClass('active')
    }
  }
})

$('.switch').click(function () {
  $(this).toggleClass('switchOn')
})
$('.forgotLink').click(function () {
  $('.signIn').slideUp('slow')
  $('.forgotForm').slideDown('slow')
})
$('.cancelLink').click(function () {
  $('.forgotForm').slideUp('slow')
  $('.signIn').slideDown('slow')
})

$('.panel-collapse').on('shown.bs.collapse', function (evt) {
  $(this).closest('.panel-default').addClass('panelActive')
})
$('.panel-collapse').on('hidden.bs.collapse', function (evt) {
  $(this).closest('.panel-default').removeClass('panelActive')
})

// tooltip initialization, only for non touch devices
if (!window.visitor.isTouch) {
  $('.tooltiped').tooltip({container: 'tooltipHolder'})
}

$('a.switcher').on('click', function (evt) {
  $('#clientSelect').removeClass('hidden')
})
$('#clientSelect').on('blur', function (evt) {
  $(this).addClass('hidden')
})
$('#clientSelect').on('change', function (evt) {
  $(this).addClass('hidden')
  window.setCustomer($(this).val())
})

$.blockUI.defaults.baseZ = 1050
$.blockUI.defaults.message = '<div><img src="/images/orange-loading.gif"><h1>LOADING...</h1></div>'
$.blockUI.defaults.css = {
  padding: 0,
  margin: 0,
  width: '30%',
  top: '40%',
  left: '35%',
  textAlign: 'center',
  color: '#FFF',
  border: 'none',
  backgroundColor: '',
  cursor: 'wait'
}

const App = {
  Collections: {}
}
window.App = App
export default App
