module.exports = {
  orderOf (value) {
    //
    // WARNING: KEEP THE INDEXES IN ORDER !!
    //
    return [
      'unknown',
      'normal',
      'low',
      'high',
      'critical',
      'failure',
      'updates_stopped'
    ].indexOf(value)
  }
}
