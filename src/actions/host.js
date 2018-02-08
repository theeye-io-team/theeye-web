import App from 'ampersand-app'

module.exports = {
  stats (id) {
    // window.location = '/hoststats/' + id
    App.navigate('/admin/hoststats/' + id)
  },
  update (id, data) {
    let host = App.state.hosts.get(id)

    if (!host) {
      console.warn('host not found %s', id)
      return
    }

    host.set(data)
  }
}
