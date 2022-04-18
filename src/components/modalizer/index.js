/**
 *
 * @author Facugon <facugon@interactar.com>
 * @version 0.0.1
 *
 * Ampersand View component for rendering Bootstrap Modals
 *
 */
import View from 'ampersand-view'
import './styles.less'

// http://stackoverflow.com/questions/18487056/select2-doesnt-work-when-embedded-in-a-bootstrap-modal
$.fn.modal.Constructor.prototype.enforceFocus = function() {};

const Modalizer = View.extend({
  template () {
    return `
    <div data-component="modalizer" class="modalizer">
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
                <button type="button" data-hook="close-${this.cid}" class="close" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 data-hook="title" class="modal-title"></h4>
              </div>
              <div class="modal-body" data-hook="body"></div>
              <div class="modal-footer" data-hook="footer">
                <div data-hook="buttons-container"></div>
              </div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `
  },
  autoRender: true,
  props: {
    closeButton: ['boolean',false,true],
    fade: ['boolean',false,true],
    removeOnHide: ['boolean',false,false],
    buttons: ['boolean',false,false],
    class: 'string',
    bodyView: 'object',
    title: ['string',false,'MODAL TITLE'],
    confirmButton: ['string',false,'Confirm'],
    cancelButton: ['string',false,'Cancel'],
    visible: ['boolean',false,false],
    backdrop: ['boolean',false,true],
    appendToParent: ['boolean', false, false]
  },
  bindings: {
    closeButton: {
      type: 'toggle',
      hook: 'close'
    },
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
      hook: 'footer',
      type: 'toggle'
    }
  },
  events: {
    'click button[data-hook=confirm]':'onClickConfirm',
    'click button[data-hook=cancel]':'onClickCancel',
    'click button[data-hook=close]':'onClickClose',
  },
  onClickConfirm () {
    this.trigger('confirm')
  },
  onClickCancel () {
    this.trigger('cancel')
  },
  onClickClose (event) {
    event.stopPropagation()
    event.preventDefault()
    this.trigger('close')
    this.hide()
  },
  //initialize (options) {
  //  this._triggerShown = this._triggerShown.bind(this)
  //  this._triggerHidden = this._triggerHidden.bind(this)
  //  this._onBeingHide = this._onBeingHide.bind(this)
  //},
  render () {
    this.renderWithTemplate(this)

    if (this.appendToParent && this.parent) {
      this.parent.el.appendChild(this.el)
    } else {
      document.body.appendChild(this.el)
    }

    const $modal = $( this.query('.modal') )
    this.$modal = $modal
    $modal.modal({
      keyboard: false,
      backdrop: this.backdrop ? 'static' : false,
      show: false
    })

    this.renderButtons()

    //this.$modal.on('hide.bs.modal', this._onBeingHide)
    //this.$modal.on('show.bs.modal', this._triggerShown)
    //this.$modal.on('hidden.bs.modal', this._triggerHidden)

    this.listenTo(this, 'change:visible', this._toggleVisibility)

    if (this.removeOnHide === true) {
      this.on('hidden',function(){
        this.remove()
      })
    }

    if (this.visible) this.show()

    const closeBtn = this.query(`button[data-hook=close-${this.cid}]`)
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        this.hide()
      })
    }
  },
  renderButtons () {
    if (this.buttons) {
      this.renderSubview(
        new ButtonsView({ confirmButton: this.confirmButton, cancelButton: this.cancelButton }),
        this.queryByHook('buttons-container')
      )
    }
  },
  renderBody () {
    if (!this.bodyView) { return }

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
    if (this.rendered === false) {
      this.render()
    }
    this.renderBody()
    this.visible = true
  },
  hide () {
    this.visible = false
  },
  /**
   * if bootstrap modal is being hided (with click or X)
   * from bootstrap modal itself
   */
  //
  // NOTE: disabled due to unexpected behaviour with outer modals.
  //
  //_onBeingHide () {
  //  if (this.visible) {
  //    // change inner state
  //    this.hide()
  //  }
  //},
  //_triggerShown () {
  //  this.trigger('shown')
  //},
  //_triggerHidden () {
  //  this.trigger('hidden')
  //},
  _toggleVisibility () {
    this.visible ? this._showElem() : this._hideElem()
  },
  _showElem () {
    this.$modal.modal('show')
  },
  _hideElem () {
    this.trigger('hide')
    this.$modal.modal('hide')
  },
  remove () {
    this.hide()
    if (this.bodyView && this.bodyView.rendered === true) {
      this.bodyView.remove()
    }
    View.prototype.remove.apply(this, arguments)
  }
})

export default Modalizer

//Modalizer.alert = (message) => {
//  let modal = new Modalizer()
//}

const ButtonsView = View.extend({
  template: `
    <div>
      <div class="col-xs-12 col-md-6">
        <button type="button"
          class="btn btn-default"
          data-hook="cancel"
          data-dismiss="modal">
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
      default: 'Confirm'
    },
    cancelButton: {
      type: 'string',
      default: 'Cancel'
    }
  },
  bindings: {
    confirmButton: {
      hook: 'confirm',
      type: 'text'
    },
    cancelButton: {
      hook: 'cancel',
      type: 'text'
    }
  }
})
