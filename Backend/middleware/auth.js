const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // On récupère le token dans le header Authorization
    // Format : "Bearer TOKEN"
    const token = req.headers.authorization.split(" ")[1];

    // On vérifie et décode le token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // On récupère l'userId du token décodé
    const userId = decodedToken.userId;

    // On ajoute l'userId à la requête pour que les controllers puissent l'utiliser
    req.auth = {
      userId: userId,
    };

    // Tout est bon, on passe au controller suivant
    next();
  } catch (error) {
    // Si erreur (pas de token, token invalide, etc.)
    res.status(401).json({ error: "Requête non authentifiée" });
  }
};
