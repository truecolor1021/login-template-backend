const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys.config");
const validateRegisterInput = require("../validation/register.validation");
const validateLoginInput = require("../validation/login.validation");
const User = require("../models/user.model");

exports.register = async (firstName, lastName, email, password, password2) => {
  const { errors, isValid } = validateRegisterInput({
    firstName,
    lastName,
    email,
    password,
    password2,
  });

  if (!isValid) {
    throw new Error(JSON.stringify(errors));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("Email already exists");
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password,
  });

  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);
  await newUser.save();

  return "success";
};

exports.login = async (email, password) => {
  const { errors, isValid } = validateLoginInput({ email, password });
  if (!isValid) {
    throw new Error(JSON.stringify(errors));
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password incorrect");
  }

  const payload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  };

  const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: 7776000 });
  return token;
};
