import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

export default MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'templates'
		this.displayProperty = 'name'
	},
	//deleteItems (hostgroups) {
	//}
})
