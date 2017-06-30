import View from 'ampersand-view'
/**
 *
 * @module components/chat
 *
 */
module.exports = {

  ChatBoxBaloon : View.extend({
    autoRender: true,
    template: `
    <div class="chat-box chat-box-baloon">
      <a href="">
        <i class="fa fa-comment"></i>&nbsp;
        <span>Chat with us.</span>
      </a>
    </div>`,
    render: function () {
      this.renderWithTemplate()

      document.body.appendChild(this.el)
    }
  }),

}
