const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription d'un nouvel utilisateur
exports.signup = (req, res, next) => {
  // Validation basique
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Email et mot de passe requis.",
    });
  }

  // Hash du mot de passe
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });

      // Sauvegarde en base
      user
        .save()
        .then(() =>
          res.status(201).json({
            message: "Compte créé avec succès !",
          })
        )
        .catch((error) => {
          // Gestion de l'erreur de duplication d'email
          if (error.code === 11000) {
            return res.status(400).json({
              message:
                "Cet email est déjà utilisé. Veuillez en choisir un autre.",
            });
          }
          // Autres erreurs
          res.status(400).json({
            message:
              "Une erreur est survenue lors de la création du compte. Veuillez réessayer.",
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        message:
          "Erreur serveur lors du traitement de votre demande. Veuillez réessayer plus tard.",
      });
    });
};

// Connexion d'un utilisateur existant
exports.login = (req, res, next) => {
  // Validation basique
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({
      message: "Email et mot de passe requis.",
    });
  }

  // Recherche de l'utilisateur
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Utilisateur non trouvé
      if (!user) {
        return res.status(401).json({
          message: "Email incorrect.",
        });
      }

      // Comparaison du mot de passe
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Mot de passe incorrect
          if (!valid) {
            return res.status(401).json({
              message: "Mot de passe incorrect.",
            });
          }

          // Tout est bon, génération du token
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => {
          res.status(500).json({
            message:
              "Erreur lors de la vérification du mot de passe. Veuillez réessayer.",
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Erreur serveur. Veuillez réessayer plus tard.",
      });
    });
};
