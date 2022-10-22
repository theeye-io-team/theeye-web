/**
 *
 * @author Facugon <facugon@interactar.com>
 * @version 0.0.1
 *
 * Ampersand View component for rendering Bootstrap Modals
 *
 */
import View from 'ampersand-view'
import ModalButtons from 'components/form/buttons'
import './styles.less'

// http://stackoverflow.com/questions/18487056/select2-doesnt-work-when-embedded-in-a-bootstrap-modal
$.fn.modal.Constructor.prototype.enforceFocus = function() {};

const Modalizer = View.extend({
  template () {
    return `
    <div data-component="modalizer" data-modalizer-id="${this.cid}" class="modalizer">
      <!-- MODALIZER CONTAINER -->
      <div data-hook="modalizer-class" class="">
        <div class="modal"
          data-modal-id="${this.cid}"
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
    center: ['boolean', false, false]
  },
  bindings: {
    center: {
      type: 'booleanClass',
      selector: '.modal-dialog',
      name: 'centered'
    },
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
    this.hide()
  },
  onClickClose (event) {
    event.stopPropagation()
    event.preventDefault()
    this.trigger('close')
    this.hide()
  },
  render () {
    this.renderWithTemplate(this)
    
    const root = getRootContainer()
    root.appendChild(this.el)

    const $modal = $( this.query('.modal') )
    this.$modal = $modal
    $modal.modal({
      keyboard: false,
      backdrop: this.backdrop ? 'static' : false,
      show: false
    })

    this.renderButtons()

    // wait fade effect
    this.$modal.on('shown.bs.modal', () => {
      this.trigger('shown')
    })
    this.$modal.on('hidden.bs.modal', () => {
      this.trigger('hidden')
    })

    if (this.removeOnHide === true) {
      this.on('hidden', function(){
        this.remove()
      })
    }

    const closeBtn = this.query(`button[data-hook=close-${this.cid}]`)
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        this.onClickClose(e)
      })
    }
  },
  renderButtons () {
    if (this.buttons) {
      const buttons = new ModalButtons({
        confirmText: this.confirmButton,
        cancelText: this.cancelButton,
        confirmAction: false
      })

      this.renderSubview(
        buttons,
        this.queryByHook('buttons-container')
      )

      this.buttonsView = buttons
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

    this.registerSubview(this.bodyView)
  },
  show () {
    if (this.rendered === false) {
      this.render()
    }
    this.renderBody()
    this.$modal.modal('show')
    this.visible = true
  },
  hide () {
    this.$modal.modal('hide')
    this.visible = false
  },
  remove () {
    if (this.bodyView && this.bodyView.rendered === true) {
      this.bodyView.remove()
    }
    View.prototype.remove.apply(this, arguments)
  }
})

const getRootContainer = () => {
  const el = document.querySelector('div[data-component=modalizer-root]')
  if (el) { return el }

  let root = document.createElement('div')
  root.setAttribute('data-component','modalizer-root')
  document.body.appendChild(root)
  return root
}

export default Modalizer

//const ButtonsView = View.extend({
//  template: `
//    <div>
//      <div class="col-xs-12 col-md-6">
//        <button type="button"
//          class="btn btn-default"
//          data-hook="cancel">
//        </button>
//      </div>
//      <div class="col-xs-12 col-md-6">
//        <button type="button"
//          class="btn btn-primary"
//          data-hook="confirm">
//        </button>
//      </div>
//    </div>
//  `,
//  props: {
//    confirmButton: {
//      type: 'string',
//      default: 'Confirm'
//    },
//    cancelButton: {
//      type: 'string',
//      default: 'Cancel'
//    }
//  },
//  bindings: {
//    confirmButton: {
//      hook: 'confirm',
//      type: 'text'
//    },
//    cancelButton: {
//      hook: 'cancel',
//      type: 'text'
//    }
//  },
//})
