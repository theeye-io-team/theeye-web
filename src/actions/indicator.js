import App from 'ampersand-app'
import XHR from 'lib/xhr'
import OperationsConstants from 'constants/operations'

module.exports = {
  applyStateUpdate (model, operation) {
    var id = model.id
    const indicator = App.state.indicators.get(id)

    if (
      operation === OperationsConstants.UPDATE ||
      operation === OperationsConstants.CREATE ||
      operation === OperationsConstants.REPLACE
    ) {
      if (!indicator) {
        // add/create
        App.state.indicators.add(model)
      } else {
        // update/replace
        if (operation === OperationsConstants.REPLACE) {
          indicator.clear({ silent: true })
        }
        indicator.set(indicator.parse(model))
      }
    } else {
      if (operation === OperationsConstants.DELETE) {
        if (!indicator) { return }
        App.state.indicators.remove(indicator)
      }
    }
  },
  create (data) {
    let indicator = new App.Models.Indicator.Factory(data)
    indicator.save()
  },
  patch (id, data) {
    let indicator = App.state.indicators.get(id)
    if (!indicator) { return }
    indicator.set(data)
    indicator.save()
  },
  remove (id) {
    let indicator = App.state.indicators.get(id)
    if (!indicator) { return }
    indicator.destroy()
  }
}
