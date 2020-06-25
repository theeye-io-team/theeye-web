export default function (attrs, options={}) {
  const store = App.state.tasks

  if (attrs.isCollection) { return attrs }
  if (attrs.isState) { return attrs } // already constructed
  let model

  if (attrs.id) {
    model = store.get(attrs.id)
    if (model) { return model }
  }

  const createModel = () => {
    let type = attrs.type
    let model
    switch (type) {
      case TaskConstants.TYPE_SCRIPT:
        model = new Script(attrs, options)
        break;
      case TaskConstants.TYPE_SCRAPER:
        model = new Scraper(attrs, options)
        break;
      case TaskConstants.TYPE_APPROVAL:
        model = new Approval(attrs, options)
        break;
      case TaskConstants.TYPE_DUMMY:
        model = new Dummy(attrs, options)
        break;
      case TaskConstants.TYPE_NOTIFICATION:
        model = new Notification(attrs, options)
        break;
      default:
        let err = new Error(`unrecognized type ${type}`)
        throw err
        break;
    }
    return model
  }

  model = createModel()
  if (options.collection !== store && !model.isNew()) {
    store.add(model, {merge:true})
  }
  return model
}
