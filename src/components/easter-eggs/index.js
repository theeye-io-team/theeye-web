
module.exports = {
  MarioWalk () {
    import(/* webpackChunkName: "mario-walk" */ './mario-walk')
      .then(mario => { mario() })
  },
  ToastyAlert () {
    import(/* webpackChunkName: "toasty-alert" */ './toasty-alert')
      .then(toasty => { toasty() })
  }
}
