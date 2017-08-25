import search from 'lib/query-params'

export default {
  setMonitorsGroupByProperty (prop) {
    const query = search.get()
    query.monitorsgroupby = { prop: prop }
    search.set(query)
  }
}
