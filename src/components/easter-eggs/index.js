
export default {
  MarioWalk () {
    import(/* webpackChunkName: "mario-walk" */ './mario-walk')
      .then(({ default: mario }) => { mario() })
  },
  ToastyAlert () {
    import(/* webpackChunkName: "toasty-alert" */ './toasty-alert')
      .then(({ default: toasty }) => { toasty() })
  }
}
