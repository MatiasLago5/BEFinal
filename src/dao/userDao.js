const User = require("../models/user");

class UserDao {
  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw Error("Error al obtener el usuario");
    }
  }
  async createUser(userData) {
    try {
      const newUser = await User.create(userData);
      return newUser;
    } catch (error) {
      throw Error("Error al crear el usuario");
    }
  }
  async updateUser(userId, userData) {
    try {
      const updatedUser = await User.findByIdAndUpdate(userId, userData, {
        new: true,
      });
      return updatedUser;
    } catch (error) {
      throw Error("Error al actualizar el usuario");
    }
  }
  async deleteUser(userId) {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      return deletedUser;
    } catch (error) {
      throw Error("Error al eliminar el usuario");
    }
  }
}

module.exports = new UserDao();