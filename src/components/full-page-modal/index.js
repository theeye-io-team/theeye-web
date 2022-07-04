import Modalizer from 'components/modalizer'
import './style.less'

export default Modalizer.extend({
  template() { return `
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
            <div class="fs-modal-content modal-content">
              <div class="fs-modal-body modal-body" data-hook="body"></div>
            </div><!-- /.modal-content -->
          </div><!-- /.modal-dialog -->
        </div><!-- /.modal -->
      </div><!-- /MODALIZER CONTAINER -->
    </div>
  `},
  bindings: {
    center: {
      type: 'booleanClass',
      selector: '.modal-dialog',
      name: 'centered'
    },
    fade: {
      type: 'booleanClass',
      selector: '[data-hook=modalizer-class]>.modal'
    },
    class: {
      hook: 'modalizer-class',
      type: 'attribute',
      name: 'class'
    }
  },
  events: {},
  renderButtons () { return },
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

    this.bodyView.on('close', () => this.onClickCancel())
  },
  hide () {
    this.$modal.modal('hide')
    this.visible = false
  },
})

// const getRootContainer = () => {
//   const el = document.querySelector('div[data-component=full-screen-modal-root]')
//   if (el) { return el }

//   let root = document.createElement('div')
//   root.setAttribute('data-component','full-screen-modal-root')
//   document.body.appendChild(root)
//   return root
// }

const getRootContainer = () => {
  const el = document.querySelector('div[data-component=modalizer-root]')
  if (el) { return el }

  let root = document.createElement('div')
  root.setAttribute('data-component','modalizer-root')
  document.body.appendChild(root)
  return root
}
