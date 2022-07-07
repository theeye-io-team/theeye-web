import Modalizer from 'components/modalizer'
import './style.less'

export default Modalizer.extend({
  initialize () {
    Modalizer.prototype.initialize.apply(this, arguments)
  },
  template () {
    return `
      <div data-component="full-page-modalizer" data-modalizer-id="${this.cid}" class="modalizer">
        <!-- MODALIZER CONTAINER -->
        <div data-hook="modalizer-class" class="">
          <div class="full-page-modalizer modal"
            data-modal-id="${this.cid}"
            tabindex="-1"
            role="dialog"
            aria-labelledby="modal"
            aria-hidden="true"
            style="display:none;">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-body" data-hook="body"></div>
              </div><!-- /.modal-content -->
            </div><!-- /.modal-dialog -->
          </div><!-- /.modal -->
        </div><!-- /MODALIZER CONTAINER -->
      </div>
    `
  }
})
