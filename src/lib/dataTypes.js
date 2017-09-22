import { Model as User } from 'models/user'
import { Model as Customer } from 'models/customer'

module.exports = {
  userType: {
    set (newVal) {
      if (!newVal.isState) {
        return { val: newVal, type: typeof newVal }
      }

      return { val: newVal, type: 'userType' }
    },
    compare (currentVal, newVal, attributeName) {
      return currentVal.id === newVal.id
    }
  },
  customerType: {
    set (newVal) {
      if (!newVal.isState) {
        return { val: newVal, type: typeof newVal }
      }
      return { val: newVal, type: 'customerType' }
    },
    compare (currentVal, newVal, attributeName) {
      return currentVal.id === newVal.id
    }
  }
}
