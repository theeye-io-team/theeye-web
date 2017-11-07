import ScriptForm from './script'
import ScraperForm from './scraper'

module.exports = function (options) {
  const task = options.model
  if (task.type === 'script') {
    return new ScriptForm (options)
  }

  if (task.type === 'scraper') {
    return new ScraperForm (options)
  }

  throw new Error(`unrecognized task type ${task.type}`)
}
