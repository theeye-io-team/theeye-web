import HostMonitorsForm from './type/host'
import NestedMonitorsForm from './type/nested'
import FileMonitorForm from './type/file'
import ProcessMonitorForm from './type/process'
import DstatMonitorForm from './type/dstat'
import PsauxMonitorForm from './type/psaux'
import ScriptMonitorForm from './type/script'
import ScraperMonitorForm from './type/scraper'

import * as MonitorConstants from 'constants/monitor'

const FormMapper = {}
FormMapper[ MonitorConstants.TYPE_HOST ] = HostMonitorsForm
FormMapper[ MonitorConstants.TYPE_NESTED ] = NestedMonitorsForm
FormMapper[ MonitorConstants.TYPE_SCRIPT ] = ScriptMonitorForm
FormMapper[ MonitorConstants.TYPE_SCRAPER ] = ScraperMonitorForm
FormMapper[ MonitorConstants.TYPE_FILE ] = FileMonitorForm
FormMapper[ MonitorConstants.TYPE_PROCESS ] = ProcessMonitorForm
FormMapper[ MonitorConstants.TYPE_DSTAT ] = DstatMonitorForm
FormMapper[ MonitorConstants.TYPE_PSAUX ] = PsauxMonitorForm

export default function (options) {
  const monitor = options.model
  let formClass = FormMapper[monitor.type]

  if (!formClass) {
    throw new Error(`unrecognized monitor type ${monitor.type}`)
  }

  return new formClass(options)
}
