module.exports = {
  low: 'icon-severity-low',
  high: 'icon-severity-high',
  critical: 'icon-severity-critical',
  unknown: 'icon-state-nonsense',
  normal: 'icon-state-normal',
  failure: 'icon-state-failure',
  updates_stopped: 'icon-state-updates_stopped',
  getIcon (state) {
    var icon = (this[state.toLowerCase()]||this.unknown)
    return icon
  }
}
