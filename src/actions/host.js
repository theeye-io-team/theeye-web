import App from 'ampersand-app'

module.exports = {
  stats (id) {
    // window.location = '/hoststats/' + id
    App.navigate('/admin/hoststats/' + id)
  }
}
