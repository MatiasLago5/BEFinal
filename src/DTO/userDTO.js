class UserDTO {
  constructor(user) {
    this.username = user.username;
    this.email = user.email;
    this.age = user.age;
  }
}

module.exports = UserDTO;
