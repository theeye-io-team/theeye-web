import View from 'ampersand-view'
import lang2ext from 'lib/lang2ext'
import ScriptActions from 'actions/script'

const GenericCollapsedContent = View.extend({
  template: `<div>no definition</div>`,
  bindings: {
    'model.hostname': { hook: 'hostname' },
    description: { hook: 'description' },
  },
  derived: {
    description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    },
  },
})

const bindings = GenericCollapsedContent.prototype.bindings

const ScraperCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div>
      <p>This task will be executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
      <h4>Request details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>URL</th>
            <th>Method</th>
            <th>Timeout</th>
            <th>Status Code</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="url"></span></td>
            <td><span data-hook="method"></span></td>
            <td><span data-hook="timeout"></span></td>
            <td><span data-hook="status_code"></span></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
    url: { hook: 'url' },
    method: { hook: 'method' },
    status_code: { hook: 'status_code' },
    timeout: { hook: 'timeout' },
  }),
  props: {
    url: 'string',
    method: 'string',
    status_code: 'string',
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(this.model,'change:config', () => {
      this.updateState()
    })
  },
  updateState () {
    if (!this.model.config) return
    this.url = this.model.config.url
    this.method = this.model.config.method
    this.status_code = this.model.config.status_code
  },
  derived: {
    timeout: {
      deps: ['model.config'],
      fn () {
        if (!this.model.config) return
        const time = this.model.config.timeout
        return (time / 1000) + ' s'
      }
    },
  },
})

const ProcessCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div>
      <p>This monitor is executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
  })
})

const FileCollapsedContent =  GenericCollapsedContent.extend({
  template: `
    <div>
      <p>This monitor is executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
    </div>
  `,
  bindings: Object.assign({}, bindings, {
  })
})

const ScriptCollapsedContent = GenericCollapsedContent.extend({
  template: `
    <div>
      <p>This monitor is executed on '<i data-hook="hostname"></i>'</p>
      <i data-hook="description">no description</i>
      <h4>Script details</h4>
      <table class="table table-stripped">
        <thead>
          <tr data-hook="title-cols">
            <th></th>
            <th>Description</th>
            <th>Filename</th>
            <th>Type</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><span data-hook="script_description"></span></td>
            <td><span data-hook="script_filename"></span></td>
            <td><span data-hook="script_language"></span></td>
            <td><button data-hook="edit_script" class="fa fa-edit btn btn-sm btn-primary"></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  events: {
    'click button[data-hook=edit_script]': 'onClickEditScript'
  },
  onClickEditScript (event) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.script_id) return

    ScriptActions.edit(this.script_id)

    return false
  },
  initialize () {
    GenericCollapsedContent.prototype.initialize.apply(this,arguments)

    this.listenToAndRun(this.model,'change:config', () => {
      this.updateState()
    })
  },
  props: {
    extension: 'string',
    filename: 'string',
    description: 'string',
    script_id: 'string'
  },
  derived: {
    formatted_description: {
      deps: ['model.description'],
      fn () {
        return this.model.description || 'no description'
      }
    },
    language: {
      deps: ['extension'],
      fn () {
        return lang2ext.langFor[this.extension]
      }
    },
  },
  bindings: Object.assign({}, bindings, {
    'model.hostname': { hook: 'hostname' },
    formatted_description: { hook: 'description' },
    filename: { hook: 'script_filename' },
    language: { hook: 'script_language' },
    description: { hook: 'script_description' },
    // disable button when not available
    script_id: {
      hook: 'edit_script',
      type: 'booleanAttribute',
      name: 'disabled',
      invert: true
    }
  }),
  updateState () {
    if (!this.model.config || !this.model.config.script) return
    const script = this.model.config.script
    this.script_id = script.id
    this.extension = script.extension
    this.filename = script.filename
    this.description = script.description
  },
})

const CollapsedContentFactory = (options) => {
  const type = options.model.type

  if (type==='scraper') {
    return new ScraperCollapsedContent(options)
  }
  if (type==='script') {
    return new ScriptCollapsedContent(options)
  }
  if (type==='process') {
    return new ProcessCollapsedContent(options)
  }
  if (type==='file') {
    return new FileCollapsedContent(options)
  }

  return new GenericCollapsedContent(options)
}

module.exports = CollapsedContentFactory
