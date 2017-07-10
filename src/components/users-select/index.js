import BaseView from 'view/base-view'

import 'select2'
import * as Select2Data from 'lib/select2data'

module.exports = BaseView.extend({
  tagName: 'div',
  className: 'form-group form-horizontal',
  template: require('./template.hbs'),
  initialize: function (options) {
    this.title = (options.title || 'ACL')
    this.name = (options.name || 'acl')

    this.optional = (options.optional || true)

    BaseView.prototype.initialize.apply(this, arguments)

    Object.defineProperty(this, 'values', {
      get: function () { return this.find('select').val() },
      set: function (values) {
        var select = this.find('select')
        select.val(values)
        select.trigger('change')
        return this
      }
    })
  },
  render: function () {
    this.renderWithTemplate()

    this.find('select').select2({
      placeholder: 'Users',
      data: Select2Data.PrepareIdValueData(
        this.collection.map(function (u) {
          return {
            text: u.attributes.email,
            id: u.attributes.email
          }
        }), {
          id: 'id',
          text: 'text'
        }
      ),
      tags: true
    })

    this.find('.tooltiped').tooltip()
  }
})
