import State from  'ampersand-state'

//const SettingsMenuState = State.extend({
//  props: {
//    visible: ['boolean',false,false]
//  }
//})

module.exports = State.extend({
  props: {
    menuSwitch: ['boolean',false,false]
    //settingsMenu: ['state',false,() => {
    //  return new SettingsMenuState()
    //}]
  },
  children: {
    //settingsMenu: SettingsMenuState
    settingsMenu: State.extend({
      props: {
        visible: ['boolean',false,false]
      }
    })
  }
})
