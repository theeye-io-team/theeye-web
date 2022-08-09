import App from 'ampersand-app'
import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import HelpTexts from 'language/help'
import HelpIconView from 'components/help-icon'
import TypeSelectionView from 'components/type-selection-view'
import MonitorFormView from '../form'
import config from 'config'

import { Factory as ResourceFactory } from 'models/resource'

import './styles.less'
const docsLink = 'core-concepts/monitors/#monitor-type'

export default function () {
  const wizard = new ResourceCreationWizard()
  wizard.render()
  const modal = new Modalizer({
    buttons: false,
    title: 'Create Monitor',
    bodyView: wizard
  })

  modal.renderSubview(
    new HelpIconView({
      link: `${config.docs}/${docsLink}`
    }),
    modal.queryByHook('title')
  )

  modal.on('hidden',() => {
    wizard.remove()
    modal.remove()
  })

  wizard.on('submitted',() => { modal.hide() })
  modal.show()
  modal.wizard = wizard
  return modal
}

const ResourceCreationWizard = View.extend({
  template: `
    <div>
      <section data-hook="type-selection-container" class="task-type-selection">
        <h1>Please, select the monitor type to continue</h1>
        <div data-hook="type-selection-view-container"></div>
      </section>
      <section data-hook="form-container"></section>
    </div>
  `,
  events: {
    'click button[data-hook=monitor-form]': function (event) {
      event.preventDefault()
      event.stopPropagation()
      let resource = new ResourceFactory({ type: event.delegateTarget.dataset.type })
      this.createForm(resource)
    }
  },
  render () {
    this.renderWithTemplate(this)
    const buttons = [
      {
        title: 'File',
        hook: 'file',
        help: HelpTexts.monitor.wizard['file'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'file' })
          this.createForm(resource)
        },
        icon_class: 'fa-file-o',
        color: '#ff8a6d'
      },{
        title: 'Process',
        hook: 'process',
        help: HelpTexts.monitor.wizard['process'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'process' })
          this.createForm(resource)
        },
        icon_class: 'fa-cog',
        color: '#1c73b9'
      },{
        title: 'Script',
        hook: 'script',
        help: HelpTexts.monitor.wizard['script'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'script' })
          this.createForm(resource)
        },
        icon_class: 'fa-code',
        color: '#c6639b'
      },{
        title: 'Web Check',
        hook: 'scraper',
        help: HelpTexts.monitor.wizard['scraper'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'scraper' })
          this.createForm(resource)
        },
        icon_class: 'fa-cloud',
        color: '#158df9'
      },{
        title: 'Nested',
        hook: 'nested',
        help: HelpTexts.monitor.wizard['nested'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'nested' })
          this.createForm(resource)
        },
        icon_class: 'fa-bullseye',
        color: '#06b777'
      },{
        title: 'Bot Host Health',
        hook: 'health',
        help: HelpTexts.monitor.wizard['health'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'dstat' })
          this.createForm(resource)
        },
        icon_class: 'fa-bar-chart',
        color: '#00b4bc'
      },{
        title: 'Bot Host Processes',
        hook: 'processes',
        help: HelpTexts.monitor.wizard['processes'],
        callback: () => {
          let resource = new ResourceFactory({ type: 'psaux' })
          this.createForm(resource)
        },
        icon_class: 'fa-cogs',
        color: '#519194'
      }
    ]

    const wizard = new TypeSelectionView({ buttons })

    this.renderSubview(
      wizard,
      this.queryByHook('type-selection-view-container')
    )
  },
  addHelpIcon (type) {
    this.renderSubview(
      new HelpIconView({
        color: [50,50,50],
        category: 'monitor_wizard_help',
        text: HelpTexts.monitor.wizard[type]
      }),
      this.queryByHook(type + '-help')
    )
  },
  /**
   * @param {Resource} resource a resource monitor instance
   */
  createForm (resource) {
    this.queryByHook('type-selection-container').remove()
    const form = new MonitorFormView({ model: resource })
    this.renderSubview(form, this.queryByHook('form-container'))
    this.form = form
    form.on('submitted', () => { this.trigger('submitted') })
  },
  remove () {
    if (this.form) {
      this.form.remove()
    }
    View.prototype.remove.apply(this,arguments)
  }
})
