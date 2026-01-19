const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*INSCRIPTION*/

exports.signup = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Email et mot de passe requis.",
    });
  }
  bcrypt.hash(password, 10).then((hash) => {
    const user = new User({
      email,
      password: hash,
    });
    user
      .save()
      .then(() => {
        res.status(201).json({
          message: "Compte créé avec succès !",
        });
      })
      .catch((error) => {
        if (error.code === 11000) {
          return res.status(409).json({
            message: "Cet email est déjà utilisé.",
          });
        }
        return res.status(500).json({
          message: "Une erreur est survenue lors de la création du compte.",
        });
      });
  });
};

/*  CONNEXION */

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email et mot de passe requis.",
    });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Email incorrect.",
        });
      }

      bcrypt.compare(password, user.password).then((valid) => {
        if (!valid) {
          return res.status(401).json({
            message: "Mot de passe incorrect.",
          });
        }

        //  Succès
        res.status(200).json({
          userId: user._id,
          token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: "24h",
          }),
        });
      });
    })
    .catch(() => {
      return res.status(500).json({
        message: "Erreur lors de la connexion.",
      });
    });
};
