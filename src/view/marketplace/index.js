import App from 'ampersand-app'
import FullContainer from 'components/fullpagecontainer'
import View from "ampersand-view"

import bootbox from "bootbox"
import Modalizer from "components/modalizer"
import TypeSelectionView from "components/type-selection-view"
import FileSaver from "file-saver"
import TaskFormView from 'view/page/task/form'

import './style.less'

export default FullContainer.extend({
  template: `
    <div data-component="marketplace-container" class="full-page-container">
      <div class="marketplace-page">
        <div class="header text-center">
          <span>TheEye Marketplace</span>
          <span data-hook="close-button" class="close-button fa fa-remove" style=""></span>
        </div>
        <div class="col-xs-3 panel-left">
          <ul class="nav nav-tabs tabs-left" data-hook="tabs-container"> </ul>
        </div>
        <div class="col-xs-9 panel-right">
          <div class="tab-content" data-hook="tab-content-container"> </div>
        </div>
      </div>
    </div>
  `,
  props: {
    visible: ['boolean',false,false],
    current_tab: 'string'
  },
  bindings: {
    visible: { type: 'toggle' }
  },
  initialize () {
    FullContainer.prototype.initialize.apply(this,arguments)

    this.autoAppend = true

    this.listenToAndRun(App.state.marketplace, 'change', () => {
      this.updateState(App.state.marketplace)
    })

    this.on('change:visible', () => {
      if (this.visible === false) {
        this.remove()
      }
    })
  },
  updateState (state) {
    if (!state||!state.menu) { return }
    this.visible = state.menu.visible
    this.current_tab = state.menu.current_tab
    this.current_content = null
  },
  render () {
    FullContainer.prototype.render.apply(this,arguments)

    this.on('change:visible', () => {
      console.log({ visible: this.visible })
      if (this.visible === true) {
        window.scrollTo(0,0)
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    })

    this.renderTabs()

    this.on('change:current_tab', () => {
      if (this.current_content !== null) {
        if (this.current_content.title !== this.current_tab) {
          if (this.current_content.remove) {
            this.current_content.remove()
          }
        }
      }
    })
  },
  renderTabs() {
    const tabs = this.queryByHook('tabs-container')
    this.renderSubview(new Tab({ name: 'Tasks' }), tabs)
    this.renderSubview(new TabContent({ title: 'Tasks' }), this.queryByHook('tab-content-container'))
  },
  events: {
    'click [data-hook=close-button]': 'onClickCloseButton',
    keydown: 'onKeyEvent',
    keypress: 'onKeyEvent',
    'click .tab-item': 'setCurrentTab'
  },
  onClickCloseButton (event) {
    event.preventDefault()
    event.stopPropagation()
    App.actions.marketplace.hide()
    return false
  },
  onKeyEvent (event) {
    if (event.keyCode === 27) {
      event.preventDefault()
      event.stopPropagation()
      App.actions.marketplace.hide()
      return false
    }
  },
  setCurrentTab (event) {
    App.actions.marketplace.toggleTab(event.target.hash.substring(1))
  }
})

const Tab = View.extend({
  props: {
    name: 'string'
  },
  template () {
    return `
      <li class="tab-item">
        <a href="#${this.name}" data-toggle="tab">${this.name}</a>
      </li>
    `
  }
})

const TabContent = View.extend({
  props: {
    search: ['string', false, ''],
    title: 'string'
  },
  template () {
    return `
      <div class="">
        <div class="row">
          <h1 class="title">${this.title}</h1>
          <div class="search">
            <i class="fa fa-search" aria-hidden="true"></i>
            <input autocomplete="off" data-hook="search-input" class="search-input" placeholder="Search">
          </div>
        </div>
        <div class="row">
          <div data-hook="elems-container"></div>
        </div>
      </div>
    `
  },
  bindings: {
    search: {
      type: 'value',
      hook: 'search-input'
    }
  },
  events: {
    'input [data-hook=search-input]': 'onSearchInput',
  },
  render () {
    this.renderWithTemplate(this)
    
    this.listenToAndRun(App.state.marketplace.tasks, 'change', this.updateState)

    if (!App.state.marketplace.tasks.fetched) {
      App.actions.marketplace.tasks.fetch()
    }
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
      this.renderSubview(taskList, this.queryByHook('elems-container'))
    }
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
                App.actions.marketplace.hide()
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
  onSearchInput (event) {
    event.stopPropagation()
    event.preventDefault()
    
    this._subviews[0]._subviews.forEach(
      view => {
        console.log([view.name, view.name.toLowerCase().includes(event.target.value.toLowerCase()), view])
        view.visible = (
          view.name.toLowerCase().includes(event.target.value.toLowerCase())
        )
      }
    )
  }
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
}
