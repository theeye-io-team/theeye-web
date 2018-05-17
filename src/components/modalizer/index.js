/**
 *
 * @author Facugon <facugon@interactar.com>
 * @version 0.0.1
 *
 * Ampersand View component for rendering Bootstrap Modals
 *
 */
const View = require('ampersand-view')

// http://stackoverflow.com/questions/18487056/select2-doesnt-work-when-embedded-in-a-bootstrap-modal
$.fn.modal.Constructor.prototype.enforceFocus = function() {};

module.exports = View.extend({
  template: `
    <div class="modalizer">
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
              <div class="modal-body" data-hook="body"></div>
              <div class="modal-footer" data-hook="buttons">
                <div data-hook="buttons-container"></div>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `,
  autoRender: true,
  props: {
    fade: ['boolean',false,true],
    removeOnHide: ['boolean',false,false],
    buttons: ['boolean',false,false],
    class: 'string',
    bodyView: 'object',
    title: ['string',false,'MODAL TITLE'],
    confirmButton: ['string',false,'CONFIRM'],
    visible: ['boolean',false,false],
    backdrop: ['boolean',false,true]
  },
  bindings: {
    fade: {
      type: 'booleanClass',
      selector: '[data-hook=modalizer-class]>.modal'
    },
    class: {
      hook: 'modalizer-class',
      type: 'attribute',
      name: 'class'
    },
    title: {
      hook: 'title',
      type: 'text'
    },
    buttons: {
      hook: 'buttons',
      type: 'toggle'
    }
  },
  events: {
    'click button[data-hook=confirm]':'onClickConfirm'
  },
  onClickConfirm () {
    this.trigger('confirm')
  },
  initialize (options) {
    this._triggerShown = this._triggerShown.bind(this)
    this._triggerHidden = this._triggerHidden.bind(this)
    this._onBeingHide = this._onBeingHide.bind(this)
  },
  render () {
    this.renderWithTemplate(this)

    document.body.appendChild(this.el)

    var $modal = $( this.query('.modal') )
    this.$modal = $modal
    $modal.modal({
      keyboard: true,
      backdrop: this.backdrop,
      show: false
    })

    if (this.buttons) {
      this.renderSubview(
        new ButtonsView({ confirmButton: this.confirmButton }),
        this.queryByHook('buttons-container')
      )
    }

    this.$modal.on('hide.bs.modal',this._onBeingHide)
    this.$modal.on('show.bs.modal',this._triggerShown)
    this.$modal.on('hidden.bs.modal',this._triggerHidden)

    this.listenTo(this,'change:visible',this._toggleVisibility)

    if (this.removeOnHide === true) {
      this.on('hidden',function(){
        this.remove()
      })
    }

    if (this.visible) this.show()
  },
  renderBody () {
    if (!this.bodyView) return
    const modalBody = this.queryByHook('body')
    if (modalBody.childNodes.length === 0) {
      if ( ! (this.bodyView.el instanceof HTMLElement) || !this.bodyView.rendered ) {
        this.bodyView.render()
      }
      modalBody.appendChild(this.bodyView.el)
    }

    this.listenTo(this.bodyView, 'remove', () => {
      this.hide()
    })
  },
  show () {
    this.renderBody()
    this.visible = true
  },
  hide () {
    this.visible = false
  },
  /**
   * if bootstrap modal is being hided (with click or X) from bootstrap modal itself
   */
  _onBeingHide () {
    if (this.visible) {
      // change inner state
      this.hide()
    }
  },
  _triggerShown () {
    this.trigger('shown')
  },
  _triggerHidden () {
    this.trigger('hidden')
  },
  _showElem () {
    this.$modal.modal('show')
  },
  _hideElem () {
    this.trigger('hide')
    this.$modal.modal('hide')
  },
  _toggleVisibility () {
    this.visible ? this._showElem() : this._hideElem()
  },
  remove () {
    this.hide()
    this.bodyView.remove()
    View.prototype.remove.apply(this, arguments)
  }
})

const ButtonsView = View.extend({
  template: `
    <div>
      <div class="col-xs-12 col-md-6">
        <button type="button"
          class="btn btn-default"
          data-dismiss="modal">
          Cancel
        </button>
      </div>
      <div class="col-xs-12 col-md-6">
        <button type="button"
          class="btn btn-primary"
          data-hook="confirm">
        </button>
      </div>
    </div>
  `,
  props: {
    confirmButton: {
      type: 'string',
      default: 'CONFIRM'
    }
  },
  bindings: {
    confirmButton: {
      hook: 'confirm',
      type: 'text'
    }
  }
})
