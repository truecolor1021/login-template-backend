const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys.config");

const validateRegisterInput = require("../validation/register.validation");
const validateLoginInput = require("../validation/login.validation");

const User = require("../models/user.model");

exports.register = (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const createUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(createUser.password, salt, (err, hash) => {
          if (err) throw err;
          createUser.password = hash;
          createUser
            .save()
            .then(() => res.json({ success: true }))
            .catch((err) => console.log(err));
        });
      });
    }
  });
};

exports.login = (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(404).json({ email: "Email not found" });
    }

    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        };
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 7776000, // 90 days
          },
          (err, token) => {
            if (err) {
              return res.status(500).json({ error: "Error signing token" });
            }
            res.json({ token: `Bearer ${token}` });
          }
        );
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
};
