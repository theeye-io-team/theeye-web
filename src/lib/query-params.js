
export default {
  get () {
    var search
    try {
      search = JSON.parse(atob(window.location.search.substr(1)))
    } catch (e) {
      if (e) return {}
    }

    return search
  },
  set (query) {
    var search = btoa(JSON.stringify(query))
    window.location.search = search
  }
}
