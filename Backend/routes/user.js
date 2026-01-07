const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

// Route pour l'inscription
router.post("/signup", userCtrl.signup);

// Route pour la connexion
router.post("/login", userCtrl.login);

module.exports = router;
