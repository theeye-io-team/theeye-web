import MassiveDeleteButton from 'components/list/header/buttons/massive-delete'
import bootbox from 'bootbox'
import UserActions from 'actions/user'
import App from 'ampersand-app'

module.exports = MassiveDeleteButton.extend({
	initialize () {
		MassiveDeleteButton.prototype.initialize.apply(this,arguments)
		this.name = 'user'
		this.displayProperty = 'username'
	},
	deleteItems (users) {
    App.state.loader.visible = true

		let deleteRequests = users.map(user => {
			return UserActions.remove(user)
		})

		$.when
      .apply($, deleteRequests)
      .then(
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
      )
      .always(() => {
        App.state.loader.visible = false
        users[0].collection.remove(users)
      })
	}
})
