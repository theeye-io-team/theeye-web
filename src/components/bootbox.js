import bootbox2 from 'bootbox'

const createFormModal = function (options, callback) {
  callback = callback || function () { return true }
  const closeCallback = function (event) {
    return callback(false) // execute callback with false argument
    // return true  // close the modal anyways (this is a close/cancel)
  }
  const saveCallback = function (event) {
    return callback(true) && true
  }
  options = options || {}
  var modal = bootbox2.dialog({
    message: options.message,
    title: options.title,
    buttons: [
      {
        label: 'Close',
        className: 'btn btn-default',
        callback: closeCallback
      },
      {
        label: 'Save',
        className: 'btn btn-primary',
        callback: saveCallback
      }
    ],
    onEscape: closeCallback
  })

  // focus on the first visible input when shown
  modal.on('shown.bs.modal', function () {
    modal.firstInput = modal.find('input:visible').first()
    modal.firstInput.focus()
  })

  return modal
}

bootbox2.form = createFormModal
export { bootbox2 as default }
