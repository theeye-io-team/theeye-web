import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

module.exports = MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'files'
		this.displayProperty = 'filename'
	}
	//deleteItems (tasks) {
	//}
})
