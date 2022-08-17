import App from "ampersand-app"
import View from "ampersand-view"
import bootbox from "bootbox"
import Modalizer from "components/modalizer"
import TypeSelectionView from "components/type-selection-view"
import FileSaver from "file-saver"
import TaskFormView from 'view/page/task/form'

export default View.extend({
  template: `
    <div>
      <h1 class="title">Tasks</h1>
      <div data-hook="button-container"></div>
    </div>
`,
  render () {
    console.log('RENDERING')
    this.renderWithTemplate(this)
    
    this.listenToAndRun(App.state.marketplace.tasks, 'change', this.updateState)

    if (!App.state.marketplace.tasks.fetched) App.actions.marketplace.tasks.fetch()
  },
  getImageAndColor (type) {
    const types = {
      script: {
        icon_class: 'fa-code',
        color: '#c6639b',
      },
      scraper: {
        icon_class: 'fa-cloud',
        color: '#0080b9',
      }, 
      approval: {
        icon_class: 'fa-thumbs-o-up',
        color: '#9fbc75'
      },
      notification: {
        icon_class: 'fa-bell-o',
        color: '#f4bc4a'
      }
    }
    return types[type]
  },
  updateState () {
    if (this.visible) {
      App.state.loader.visible = !App.state.marketplace.tasks.fetched
    }
    if (App.state.marketplace.tasks.fetched) {
      const taskList = new TypeSelectionView({
        buttons: App.state.marketplace.tasks.list.map(
          task => Object.assign(
            task,
            this.getImageAndColor(task.type),
            { callback: this.onDownload }
          )
        ),
        inline: true
      })
      this.renderSubview(
        taskList,
        this.queryByHook('button-container')
      )
    }
  },
  onDownload (id) {
    App.state.loader.visible = true
    App.actions.marketplace.tasks.getRecipe(id).then(
      recipe => {
        App.state.loader.visible = false
        const dialog = bootbox.dialog({
          title: "Downloading task",
          message: "Do you want to import this task to your environment, or get the task recipe?",
          buttons: {
            import: {
              label: 'Import to your environment',
              callback () {
                App.actions.marketplace.menu.hide()
                console.log(recipe)
                const task = App.actions.task.parseSerialization(recipe)
                renderImportFormTask(task)
              }
            },
            recipe: {
              label: 'Download the task recipe',
              callback () {
                var jsonContent = JSON.stringify(recipe)
                var blob = new Blob([jsonContent], { type: 'application/json' })
                let fname = recipe.name.replace(/ /g,'_')
                FileSaver.saveAs(blob, `${fname}.json`)
              }
            }
          }
        })
      }
    )
  },
})

const renderImportFormTask = (task) => {
  let script, mode = 'import'
  if (task.script_id) {
    script = App.state.files.get(task.script_id)
    if (!script) {
      task.script_id = null
    } else {
      mode = null
    }
  }

  script || (script = task.script)

  const form = new TaskFormView({ model: task, mode })
  const modal = new Modalizer({
    title: 'Import task',
    bodyView: form
  })
  
  form.on('submit', data => {
    data.script = script.serialize() // data from imported file. was not persisted yet
    if (this.submit) {
      this.submit(data)
    } else {
      App.actions.task.create(data)
      //if (task.type === 'script' && mode === 'import') {
      //  App.actions.file.create(script.serialize(), (err, file) => {
      //    data.script_id = file.id
      //    delete data.script_name
      //    App.actions.task.create(data)
      //  })
      //} else {
      //  App.actions.task.create(data)
      //}
    }
    modal.remove()
    form.remove()
  })

  modal.show()

  debugger
}