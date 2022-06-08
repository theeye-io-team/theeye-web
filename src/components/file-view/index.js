import View from 'ampersand-view'
import Modalizer from 'components/modalizer'
import isDataURI from 'validator/lib/isDataURI'
import isURL from 'validator/lib/isURL'

import './style.less'

const BodyView = View.extend({
  props: {
    title: 'string',
    file:  'object'
  },
  initialize () {
    // if (isURL(this.file)) {
    //   this.file = this.getBlobFromURL(this.file, this.title)
    // }
    
    console.log(this.file)

    View.prototype.initialize.apply(this, arguments)
  },
  getBlobFromURL (url, title) {
    let file;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/favicon.png");
    xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
    xhr.onload = () => {
      blob = xhr.response;//xhr.response is now a blob object
      return blob
    }
    xhr.send();
  },
  template: `<div>
    <div class="file-content" data-hook="file-content"></div>
    <a download class="button" data-hook="file-download">Download</a>
  </div>`,
  renderFile () {
    console.log('haha jonatan youre banging my daughter')
    let el = this.queryByHook('file-content')
    let download = this.queryByHook('file-download')
    download.href = URL.createObjectURL(this.file)

    if (this.file.type.includes('image')) {
      el.innerHTML = `<img src=${URL.createObjectURL(this.file)} 
                      style="max-width: 80vw; max-height: 80vh;">`
    } else if (this.file.type.includes('file')) {
      let reader = new FileReader();

      let codemirror = CodeMirror(this.queryByHook('file-content'), {
        tabindex: 0,
        value: 'loading file...',
        lineNumbers: true,
        theme: '3024-night',
        tabSize: 2,
        smartIndent: true,
        readOnly: true,
        mode: 'shell'
      })

      reader.onload = () => {
        codemirror.setValue(reader.result)
        setTimeout(() => { this.codemirror.refresh() }, 500)
      }
    
      reader.readAsText(this.file)

    } else {
      el.innerHTML = `<div>Well this is awkward</div>`
    }
  },
  render () {
    this.renderWithTemplate(this)

    
    this.renderFile()
  },
  
})

const Modal = Modalizer.extend({
  props: {
    title: 'string',
    file:  'string'
  },
  dataURLtoBlob (dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n)
    while(n--){
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], {type:mime})
  },
  initialize () {
    const body = new BodyView({
      file: this.dataURLtoBlob(this.file), 
      title: this.title
    })
    this.bodyView = body
    this.buttons = false // disable built-in
    this.on('hidden', () => { this.remove() })
    Modalizer.prototype.initialize.apply(this, arguments)
  }
})

export default View.extend({
  props: {
    title: 'string',
    file:  'string'
  }, 
  template: `<button type="button" class="btn btn-primary" data-hook="button">Show file</button>`,
  events: {
    'click button': function (event) {
      const modal = new Modal({ title: this.title, file: this.file })

      modal.show()
    }
  }
})