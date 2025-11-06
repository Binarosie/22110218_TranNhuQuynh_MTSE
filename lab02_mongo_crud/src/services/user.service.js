const User = require("../models/user.model");

// CREATE
exports.createUser = (data) => {
  return User.create(data);
};

// READ ALL
exports.getAllUsers = () => {
  return User.find();
};

// READ BY ID
exports.getUserById = (id) => {
  return User.findById(id);
};

// UPDATE
exports.updateUser = (id, data) => {
  return User.findByIdAndUpdate(id, data, { new: true });
};

// DELETE
exports.deleteUser = (id) => {
  return User.findByIdAndDelete(id);
};
