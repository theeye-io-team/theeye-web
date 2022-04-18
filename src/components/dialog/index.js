import Container from '../fullpagecontainer'
import './styles.less'

export default Container.extend({
  initialize () {
    this.containerClass = ['dialog']
    Container.prototype.initialize.apply(this, arguments)
  }
})
