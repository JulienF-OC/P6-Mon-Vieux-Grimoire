const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  // On hash le mot de passe avec bcrypt (10 tours de cryptage)
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      // On crée un nouvel utilisateur avec l'email et le mot de passe hashé
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      // On sauvegarde l'utilisateur dans la base de données
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Connexion d'un utilisateur existant
exports.login = (req, res, next) => {
  // On cherche l'utilisateur dans la base de données par son email
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Si l'utilisateur n'existe pas
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire identifiant/mot de passe incorrecte" });
      }
      // On compare le mot de passe envoyé avec le hash stocké en base
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Si le mot de passe est incorrect
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire identifiant/mot de passe incorrecte" });
          }
          // Si tout est bon, on renvoie un token JWT
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
