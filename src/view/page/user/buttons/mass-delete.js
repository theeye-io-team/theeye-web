import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import bootbox from 'bootbox'
import loading from 'components/loading'
import UserActions from 'actions/user'
import $ from 'jquery'

export default MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'user'
		this.displayProperty = 'username'
	},
	deleteItems (users) {
		const waiting = loading()

		let deleteRequests = users.map(user => {
			return UserActions.remove(user)
		})

		$.when.apply($, deleteRequests).then(
			function () {
				console.log(arguments)
				bootbox.alert({
					title: 'Users deleted',
					message: 'That\'s it, they are gone. Congrats.'
				})
			},
			function (jqXHR, textStatus, errorThrown) { // signature is that of a $.ajax.fail
				console.log(arguments)
				bootbox.alert({
					title: 'Users deleted (some)',
					message: 'Well, some (or all) the delete requests came back with errors. Please refresh now.'
				})
			}
		).always(() => {
			waiting.modal('hide')
			users[0].collection.remove(users)
		})
	}
})
