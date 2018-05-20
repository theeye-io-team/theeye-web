import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

module.exports = MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'templates'
		this.displayProperty = 'name'
	},
	//deleteItems (hostgroups) {
	//}
})
