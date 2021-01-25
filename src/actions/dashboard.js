import App from 'ampersand-app'
import after from 'lodash/after'
import search from 'lib/query-params'

export default {
  setMonitorsGroupByProperty (prop) {
    const query = search.get()
    query.monitorsgroupby = { prop }
    const qs = search.set(query)

    App.Router.navigate(`dashboard?${qs}`, { replace: true })
  },
  setTasksGroupByProperty (prop) {
    const query = search.get()
    query.tasksgroupby = { prop }
    const qs = search.set(query)

    App.Router.navigate(`dashboard?${qs}`, { replace: true })
    // App.Router.reload()
  },
  loadNewRegisteredHostAgent (host) {
    App.state.loader.visible = false
    App.actions.settingsMenu.hide('customer')
    const resourcesWasEmpty = Boolean(App.state.resources.length === 0)
    const step = after(2, function () {
      if (resourcesWasEmpty) {
        App.state.onboarding.trigger('first-host-registered')
      }
      // App.state.dashboard.groupResources()
    })

    App.state.resources.fetch({ success: step, error: step })
    App.state.hosts.fetch({ success: step, error: step })
  },
  fetchData (options) {
    let resourcesToFetch = 9

    const done = after(resourcesToFetch, () => {
      App.state.loader.visible = false
    })

    const step = () => {
      App.state.loader.step()
      done()
    }

    const nextStep = () => {
      step()

      App.state.tasks.fetch({
        data: { unassigned: true },
        success: () => {
          App.state.dashboard.groupTasks()
          App.state.workflows.forEach(workflow => {
            App.actions.workflow.populate(workflow)
          })

          //App.actions.onHold.check()
          step()
        },
        error: step,
        reset: true
      })
    }

    App.state.workflows.fetch({ success: nextStep, error: nextStep })
    App.state.events.fetch({ success: step, error: step })
    App.state.files.fetch({ success: step, error: step })
    App.state.hosts.fetch({ success: step, error: step })
    App.state.tags.fetch({ success: step, error: step })
    App.state.members.fetch({ success: step, error: step })
    App.state.indicators.fetch({ success: step, error: step })
    App.state.resources.fetch({
      success: () => {
        App.state.dashboard.groupResources()
        step()
      },
      error: step,
      reset: true
    })
  }
}
