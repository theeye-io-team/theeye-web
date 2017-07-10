import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

export default MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'name'
		this.displayProperty = 'hostname_regex'
	},
	//deleteItems (hostgroups) {
	//}
})
