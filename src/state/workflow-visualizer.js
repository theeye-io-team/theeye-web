import App from 'ampersand-app'
import State from  'ampersand-state'
import graphlib from 'graphlib'

module.exports = State.extend({
  //graphlib,
  props: {
    graph: 'object'
  },
  tarjan () {
    return graphlib.alg.tarjan(this.graph)
  },
  isAcyclic () {
    return graphlib.alg.isAcyclic(this.graph)
  },
  findCycles () {
    return graphlib.alg.findCycles(this.graph)
  },
  components () {
    return graphlib.alg.components(this.graph)
  },
  topsort () {
    return graphlib.alg.topsort(this.graph)
  }
})
