export function PrepareTags (tags) {
  if (!Array.isArray(tags) || tags.length === 0) return []
  return tags.map(function (tag) {
    return { id: tag.name, text: tag.name }
  })
}

export function PrepareHosts (hosts) {
  if (!Array.isArray(hosts) || hosts.length === 0) return []
  return hosts.map(function (host) {
    return { id: host.id, text: host.hostname }
  })
}

export function PrepareScripts (scripts) {
  if (!Array.isArray(scripts) || scripts.length === 0) return []
  return scripts.map(function (script) {
    return { id: script.id, text: script.filename }
  })
}

export function PrepareIdValueData (data, options) {
  options || (options = {})
  var id = options.id || 'id'
  var text = options.text || 'value'

  if (!Array.isArray(data) || data.length === 0) return []
  return data.map(function (item) {
    return {
      id: item[id],
      text: item[text]
    }
  })
}

export function PrepareEvents (events) {
  if (!Array.isArray(events) || events.length === 0) {
    return []
  }

  var optgroup = events.reduce(function (optgroup, event) {
    var emitter = event.emitter
    if (!emitter) {
      console.error('event doesn\'t has an Emitter', event)
    } else {
      var host = event.emitter.host

      var hostname = host ? host.hostname : ''

      var type = (emitter._type || emitter.type)

      var label = type + ' ' + hostname

      var opt = {
        id: event.id,
        text: label + ' > ' + emitter.name + ', ' + event.name
      }

      if (!optgroup[ label ]) {
        optgroup[ label ] = {
          text: label,
          children: []
        }
      }

      optgroup[ label ].children.push(opt)
    }
    return optgroup
  }, {})

  var result = []
  for (var o in optgroup) {
    result.push(optgroup[o])
  }

  return result
}
