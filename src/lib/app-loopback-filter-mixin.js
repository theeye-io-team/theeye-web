import AmpersandCollection from 'ampersand-rest-collection'

const FetchOptions = function (input) {
  let output = {
    'success': function (data, response, options) { },
    'error': function (data, response, options) { }
  }
  return extend({}, output, input)
}

export default {
  /**
   *
   *
   */
  initialize: function (values,options) {
    AmpersandCollection.prototype.initialize.apply(this,arguments)

    this.filters = {}
    options || (options = {})
    if (options.childUrlPath) {
      this.url += '/' + options.childUrlPath
    }
    if (options.filters) {
      this.filters = options.filters
    }
  },
  /**
   *
   * Extend fetch but using default this.filters if defined.
   * Everytime the collection is fetched the same filters will be applied
   *
   */
  fetch: function (options) {
    var query = {}
    if (this.filters) {
      query = {
        data: {
          // filter is how strongloop admit query
          filter: this.filters
        }
      }
    }
    return AmpersandCollection.prototype
      .fetch.call(this, Object.assign({}, query, options))
  },
  filterFetch (filter) {
    return this.fetch({
      data: {
        filter: filter
      }
    })
  }
}
