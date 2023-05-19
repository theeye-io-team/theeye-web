import Collection from 'ampersand-collection'

export default Collection.extend({
  initialize () {
    Collection.prototype.initialize.apply(this, arguments)
    this.reset()
  },
  reset (models) {
    const reset = Collection.prototype.reset
    if (!models) {
      reset.call(this, this.initialState) // reset to original state
    } else {
      reset.call(this, models)
    }
  },
  clear () {
    this.reset([])
  }
})
