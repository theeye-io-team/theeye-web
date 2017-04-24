window.$ = window.jQuery = require('jquery')
var bootstrap = require('bootstrap')
var tagsinput = require('bootstrap-tagsinput')
var typeaheadjs = require('typeahead.js-browserify')
typeaheadjs.loadjQueryPlugin()
var InputView = require('components/input-view')

var TagsInput = InputView.extend({
  props: {
    data: 'object',
    name: ['string', true, 'tags'],
    maxTags: 'number',
    itemValue: ['any', false, null],
    itemText: ['any', false, null],
    required: ['boolean'],
    typeaheadjs: 'object',
    freeInput: ['boolean', false, false],
    tagsinput: ['array', false, function () {
      return []
    }]// change events does not trigger by itself on arrays. force with trigger
  },
  initialize: function () {
    var self = this

    this.tests = [
      function () {
        var tagsinput = this.tagsinput
        if (
          !Array.isArray(tagsinput) ||
          tagsinput.length <= 0
        ) return this.requiredMessage
      }
    ]

    InputView.prototype.initialize
      .apply(this, arguments)

    if (this.inputValue) {
      var tags = this.inputValue.split(',')
      tags.forEach(function (tag) {
        self.tagsinput.push(tag)
      })
    }
  },
  derived: {
    value: {
      deps: ['tagsinput'],
      fn: function () {
        var items = this.tagsinput
        return items
      }
    }
  },
  render: function () {
    InputView.prototype.render.apply(this, arguments)

    var $input = $(this.query('input'))

    var self = this
    var options = {
      maxTags: this.maxTags,
      freeInput: this.freeInput
    }
    if (this.itemValue) options.itemValue = this.itemValue
    if (this.itemText) options.itemText = this.itemText
    if (this.typeaheadjs) options.typeaheadjs = this.typeaheadjs

    $input.tagsinput(options)

    $input.on('itemAdded', function (event) {
      var items = $input.tagsinput('items')
      self.set('tagsinput', items)
      self.trigger('change:tagsinput', this, items)
    })

    $input.on('itemRemoved', function (event) {
      var items = $input.tagsinput('items')
      self.set('tagsinput', items)
      self.trigger('change:tagsinput', this, items)
    })

    this.$input = $input
  },
  events: {
    'blur .tt-input': 'onTagsinputBlur'
  },
  onTagsinputBlur: function () {
    this.setValue([this.$input.tagsinput('input').val()])
  },
  setValue: function (value) {
    InputView.prototype.setValue.apply(this, arguments)

    var self = this
    if (this.$input) {
      if (value instanceof Array) {
        value.forEach(function (tag) {
          self.$input.tagsinput('add', tag)
        })
      } else if (value instanceof String) {
        self.$input.tagsinput('add', value)
      }
    }
  },
  clear: function () {
    InputView.prototype.initialize
      .apply(this, arguments)

    // empty arrat
    this.tagsinput.length = 0
    this.tagsinput = []
    this.$input.tagsinput('removeAll')
    this.trigger('change:tagsinput')
  }
})

module.exports = TagsInput
