import App from 'ampersand-app'
import EditModalizer from 'view/page/task/edit-modalizer'
// import TasksPage from 'view/page/task'
import { Task } from 'models/task'
import Route from 'lib/router-route'
//import bootbox from 'bootbox'

class TasksRoute extends Route {
  // indexRoute () {
  //   App.state.events.fetch()
  //   App.state.tags.fetch()
  //   App.state.tasks.fetch({ data: { unassigned: true } })
  //   App.state.resources.fetch()
  //   App.state.hosts.fetch()
  //   App.state.files.fetch()
  //   App.state.members.fetch()
  //
  //   return new TasksPage({ collection: App.state.tasks })
  // }

  editRoute (options) {
    const id = options.id

    App.state.tags.fetch()

    // pre fetch extra file data
    const task = new Task({ id })
    task.fetch({
      success: () => {
        const editView = new EditModalizer({
          model: task.mutate()
        })
        editView.show()
      }
    })

    // if (!App.state.currentPage) {
    //   return this.indexRoute()
    // }
  }
}

export default TasksRoute
