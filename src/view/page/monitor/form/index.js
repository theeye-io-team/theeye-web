import NestedMonitorsForm from './type/nested'
import MonitorConstants from 'constants/monitor'

module.exports = function (options) {
  const monitor = options.model

  if (monitor.type === MonitorConstants.TYPE_NESTED) {
    return new NestedMonitorsForm (options)
  }

  throw new Error(`unrecognized monitor type ${monitor.type}`)
}
