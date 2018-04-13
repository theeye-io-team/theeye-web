import State from 'ampersand-state'
import JobModels from 'models/job'

const Ngrok = State.extend({
  props: {
    last_update: 'date',
    active: ['boolean',false,false],
    url: 'string',
    last_job_id: 'string'
  },
  children: {
    last_job: JobModels.NgrokIntegrationJob
  },
  derived: {
		tunnel_url: {
			deps: ['last_job.result.url'],
			fn () {
				return this.last_job.result.url
			}
		},
		ngrok_error: {
			deps: ['last_job.result.details','last_job.state'],
			fn () {
				if (this.last_job.state === 'failure') {
					return this.last_job.result.details.err
				}
				return ''
			}
		}
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
