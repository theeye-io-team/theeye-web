import TasksPage from 'view/page/task'
import App from 'ampersand-app'
import Route from 'lib/router-route'
//import bootbox from 'bootbox'

class TasksRoute extends Route {
  indexRoute () {
    App.state.events.fetch()
    App.state.tags.fetch()
    App.state.tasks.fetch()
    App.state.resources.fetch()
    App.state.hosts.fetch()
    App.state.files.fetch()
    //App.state.scripts.fetch()
    App.state.members.fetch()
    //App.state.users.fetch({
    //  data:{ where:{
    //    $and:[
    //      {credential: { $ne:'agent' }},
    //      {credential: { $ne:'viewer' }},
    //    ]
    //  } }
    //})

    return new TasksPage({ collection: App.state.tasks })
  }
}

module.exports = TasksRoute
