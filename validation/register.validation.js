const validator = require("validator");
const isEmpty = require("is-empty");

module.exports = (data) => {
  let errors = {};
  data.firstName = !isEmpty(data.firstName) ? data.firstName : "";
  data.lastName = !isEmpty(data.lastName) ? data.lastName : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (validator.isEmpty(data.firstName)) {
    errors.firstName = "FirstName field is required";
  }
  if (validator.isEmpty(data.lastName)) {
    errors.lastName = "LastName field is required";
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid!";
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (!validator.equals(data.password, data.password2)) {
    errors.password2 = "Passwords do not match!";
  }
  if (validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
