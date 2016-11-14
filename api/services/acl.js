
module.exports = {
  isAdmin (user) {
    return user.credential != 'user' && user.credential != 'viewer' ;
  }
}
