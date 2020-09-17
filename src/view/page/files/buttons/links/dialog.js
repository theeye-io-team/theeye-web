import Modalizer from 'components/modalizer'
import App from 'ampersand-app'
import Help from 'language/help'
import Collection from 'ampersand-collection'
import View from 'ampersand-view'

import './styles.less'

export default Modalizer.extend({
  initialize () {
    this.title = 'Links'
    //this.buttons = false // disable build-in modal buttons
    Modalizer.prototype.initialize.apply(this, arguments)

    this.on('hidden', () => { this.remove() })
  },
  template: `
    <div data-component="links-dialog" class="modalizer">
      <!-- MODALIZER CONTAINER -->
      <div data-hook="modalizer-class" class="">
        <div class="modal"
          tabindex="-1"
          role="dialog"
          aria-labelledby="modal"
          aria-hidden="true"
          style="display:none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button"
                  class="close"
                  data-dismiss="modal"
                  aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body">
                <div data-hook="container" class="grid-rows-container"></div>
              </div>
            </div><!-- /MODAL-CONTENT -->
          </div><!-- /MODAL-DIALOG -->
        </div><!-- /MODAL -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `,
  render () {
    Modalizer.prototype.render.apply(this, arguments)
    const model = this.model

    this.renderCollection(
      this.model.linked_models,
      Item,
      this.queryByHook('container'),
      {
        emptyView: View.extend({
          template: `
            <div>
              <div data-hook="loading-container">
                <div style="width:100%;"></div>
                <div style="width:100%;">Loading...</div>
                <div style="width:100%;"></div>
              </div>
              <div data-hook="empty-container">
                This file is not being used.
                <a href="#" data-hook="remove">
                  Remove? <i class="fa fa-trash"></i>
                </a>
              </div>
            </div>
          `,
          events: {
            "click [data-hook=remove]": (event) => {
              event.preventDefault()
              event.stopPropagation()
              App.actions.file.remove(model.id)
              this.hide()
            }
          },
          props: {
            ready: [ 'boolean', false, false ]
          },
          bindings: {
            ready: [
              {
                hook: 'loading-container',
                type: 'toggle',
                invert: true
              },
              {
                hook: 'empty-container',
                type: 'toggle'
              }
            ]
          },
          render () {
            this.renderWithTemplate()
            this.listenToAndRun(model, 'change:is_loading', () => {
              if (model.is_loading !== true) {
                this.ready = true
              }
            })
          }
        })
      }
    )
  }
})

const Item = View.extend({
  template: `
    <div class="grid-columns-container">
      <div class="grid-column-3" data-hook="name"></div>
      <div data-hook="_type"></div>
    </div>
  `,
  bindings: {
    'model.name': { hook: 'name' },
    'model._type': { hook: '_type' },
  }
})
