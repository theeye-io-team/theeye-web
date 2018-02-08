import State from 'ampersand-state'
import JobModels from 'models/job'

const Ngrok = State.extend({
  props: {
    last_update: 'date',
    active: 'boolean',
    url: 'string',
    last_job_id: 'string'
  },
  children: {
    last_job: JobModels.NgrokIntegrationJob
  },
  initialize () {
    State.prototype.initialize.apply(this,arguments)

    this.listenTo(this,'change:last_job_id',() => {
      this.last_job.id = this.last_job_id
    })
  }
})
const Integrations = State.extend({
  children: {
    ngrok: Ngrok
  }
})

export default Integrations
