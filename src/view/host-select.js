import App from 'ampersand-app'
import SelectView from 'components/select2-view'
//import FilteredCollection from 'ampersand-filtered-subcollection'
import * as MonitorConstants from 'constants/monitor'
import * as StateConstants from 'constants/states'

export default SelectView.extend({
  initialize (specs) {
    //let filters = []
    //if (
    //  Array.isArray(specs.filterOptions) &&
    //  specs.filterOptions.length
    //) {
    //  filters = filters.concat(specs.filterOptions)
    //}

    const hosts = App.state.hosts.map(host => {
      const monitor = App.state.resources.find(r => {
        return r.type === MonitorConstants.TYPE_HOST && r.host_id === host.id
      })

      let classList
      let hostname = host.hostname
      if (monitor?.state === StateConstants.STOPPED) {
        classList = [ 'warning' ]
        hostname += ' (stopped reporting)'
      }

      return {
        id: host.id,
        hostname,
        classList
      }
    })

    //const options = new FilteredCollection(hosts, { filters })
    //this.options = options
    this.options = hosts
    this.multiple = specs.multiple || false
    this.tags = specs.tags || false
    this.label = specs.label || 'Host'
    this.name = specs.name || 'host'
    this.styles = 'form-group'
    this.unselectedText = 'select a host'
    this.idAttribute = 'id'
    this.textAttribute = 'hostname'

    SelectView.prototype.initialize.apply(this, arguments)
  }
})

