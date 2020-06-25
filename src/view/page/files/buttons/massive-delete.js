import App from 'ampersand-app'
import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'

export default MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'files'
		this.displayProperty = 'filename'
	},
	deleteItems (models) {
    App.actions.file.massiveDelete(models)
	}
})
