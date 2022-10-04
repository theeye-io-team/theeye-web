import App from 'ampersand-app'
import FullContainer from 'components/fullpagecontainer'
import View from "ampersand-view"

import bootbox from "bootbox"
import Catalogue from "components/catalogue"
import FileSaver from "file-saver"
import Titles from 'language/titles'

import WorkflowCreateForm from 'view/page/workflow/create-form'
import { importForm as TaskImportForm } from 'view/page/task/create-form'

import './style.less'

export default FullContainer.extend({
  template: `
    <div data-component="marketplace-container" class="full-page-container">
      <div class="marketplace-page">
        <div class="header text-center">
          <span class="main-title">${Titles.marketplace.main}</span>
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
    visible: ['boolean', false, false],
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
    if (!state) { return }
    this.visible = state.visible
    this.current_tab = state.current_tab
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
    this.listenToAndRun(this, 'change:current_tab', () => {
      if (this.current_content) {
        if (this.current_content?.name !== this.current_tab) {
          if (this.current_content.remove) {
            this.current_content.remove()
          }
        }
      }

      this.renderTabContent()
    })
  },
  renderTabContent () {
    if (this.current_tab) {
      const content = new TabContent({ name: this.current_tab })
      this.current_content = content
      this.renderSubview(
        content,
        this.queryByHook('tab-content-container')
      )
    }
  },
  renderTabs () {
    const tabs = this.queryByHook('tabs-container')

    this.renderSubview(new Tab({ name: 'Tasks' }), tabs)
    this.renderSubview(new Tab({ name: 'Workflows' }), tabs)
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
    const tabName = event.target.hash.substring(1)
    App.actions.marketplace.toggleTab(tabName.toLowerCase())
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
  initialize () {
    View.prototype.initialize.apply(this, arguments)
    this.listenToAndRun(App.state.marketplace, `change:${this.name}`, this.updateState)
    App.actions.marketplace.fetch(this.name)
  },
  updateState () {
    this.store = App.state.marketplace[this.name]
  },
  props: {
    search: ['string', false, ''],
    name: 'string',
    store: ['array', false, () => { return [] }]
  },
  template () {
    return `
      <div data-component="tab-content">
        <div>
          <div class="search">
            <i class="search-icon fa fa-search" aria-hidden="true"></i>
            <input autocomplete="off" data-hook="search-input" class="search-input" placeholder="Search">
          </div>
        </div>
        <div>
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

    this.listenToAndRun(this, `change:store`, () => {
      if (Array.isArray(this.store) && this.store.length > 0) {
        const catalogue = new Catalogue({
          buttons: this.store.map( // store is an array
            data => Object.assign(
              data,
              this.getImageAndColor(data.type),
              {
                callback: () => {
                  this.onDownload(data.id, this.name)
                }
              }
            )
          ),
          inline: true
        })

        this.renderSubview(catalogue, this.queryByHook('elems-container'))
        this.catalogue = catalogue
      }
    })
  },
  getImageAndColor (type) {
    const types = {
      workflow: {
        icon_class: 'fa fa-sitemap',
        icon_color: '#bc9ad6',
      },
      script: {
        icon_class: 'fa fa-code',
        icon_color: '#c6639b',
      },
      scraper: {
        icon_class: 'fa fa-cloud',
        icon_color: '#0080b9',
      }, 
      approval: {
        icon_class: 'fa fa-thumbs-o-up',
        icon_color: '#9fbc75'
      },
      notification: {
        icon_class: 'fa fa-bell-o',
        icon_color: '#f4bc4a'
      }
    }
    return types[type]
  },
  onDownload (id, type) {
    App.state.loader.visible = true
    App.actions.marketplace
      .getSerialization(id, type)
      .then(serialization => {
        App.state.loader.visible = false

        const dialog = bootbox.dialog({
          title: "Downloading task",
          message: "Do you want to import this task to your environment, or get the task recipe?",
          buttons: {
            import: {
              label: 'Import to your environment',
              callback () {
                App.actions.marketplace.hide()
                importSerialization(serialization, type)
              }
            },
            recipe: {
              label: 'Download the task recipe',
              callback () {
                var jsonContent = JSON.stringify(serialization)
                var blob = new Blob([jsonContent], { type: 'application/json' })
                let fname = serialization.name.replace(/ /g,'_')
                FileSaver.saveAs(blob, `${fname}.json`)
              }
            }
          }
        })
      })
      .catch(err => {
        App.state.loader.visible = false
        console.error(err)
      })
  },
  onSearchInput (event) {
    event.stopPropagation()
    event.preventDefault()

    const views = this.catalogue._subviews
    const search = event.target.value.toLowerCase()

    if (search.length === 0) {
      views.forEach(v => v.visible = true)
      return
    }

    if (search.length < 3) {
      return
    }
    
    views.forEach(view => {
      const isVisible = view.name
        .toLowerCase()
        .includes(search)
      view.visible = isVisible
    })
  }
})

const importSerialization = (serialization, type) => {
  if (type === 'tasks') {
    const task = App.actions.task.parseSerialization(serialization)
    TaskImportForm(task)
  } else if (type === 'workflows') {
    const workflow = App.actions.workflow.parseSerialization(serialization)
    WorkflowCreateForm(workflow)
  } else {
    const errMsg = `${type} not handled`
    console.error(errMsg)
    throw new Error(errMsg)
  }
}
