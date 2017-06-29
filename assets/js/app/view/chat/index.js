
/**
 *
 * @module components/chat
 *
 */
const ChatBox = (function(){

  const ChatBoxBaloon = BaseView.extend({
    template: `
    <div class="chat-box chat-box-baloon">
      <i class="fa fa-comment"></i>&nbsp;
      <span>Enter TheEye! Chat with us.</span>
    </div>`,
    render: function () {
      this.renderTemplate()

      this.el.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 1000;
        background: #304269;
        border: 1px solid #FFF;
        border-radius: 25px;
        padding: 10px;
        padding-left: 15px;
        padding-right: 15px;
        box-shadow: 5px 5px 5px #888888;
        font-size: 16px;
        font-weight: 600;

      `

      document.body.appendChild( this.el )
    }
  })

  return {
    ChatBoxBaloon: ChatBoxBaloon
  }

})()
