
/**
 *
 * @module components/chat
 *
 */
const ChatBox = (function(){

  const ChatBoxBaloon = BaseView.extend({
    autoRender: true,
    template: [
    '<div class="chat-box chat-box-baloon">',
      '<a href="https://community.theeye.io" target="_blank">',
        '<i class="fa fa-comment"></i>&nbsp;',
        '<span>Chat with us.</span>',
      '</a></div>'
    ].join(''),
    render: function () {
      this.renderTemplate()

      document.body.appendChild(this.el)
    },
    events: {
    }
  })

  return {
    ChatBoxBaloon: ChatBoxBaloon
  }

})()
