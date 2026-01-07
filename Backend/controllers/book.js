const Book = require("../models/Book");
const fs = require("fs");

// Créer un livre
exports.createBook = (req, res, next) => {
  // Les données du livre sont dans req.body
  const bookObject = JSON.parse(req.body.book);

  // On supprime l'_id envoyé par le frontend MongoDB va en créer un
  delete bookObject._id;
  // On supprime l'userId envoyé (on utilise celui du token pour la sécurité)
  delete bookObject._userId;

  // On crée un nouveau livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Celui du token (middleware auth)
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // URL de l'image uploadée
  });

  // On sauvegarde en base
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// Récupérer un livre spécifique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  // Si une nouvelle image est uploadée, req.file existe
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  // On supprime l'userId pour éviter qu'un utilisateur modifie l'userId d'un livre
  delete bookObject._userId;

  // On cherche le livre
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification : l'utilisateur créateur du livre ?
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        // Si nouvelle image, on supprime l'ancienne
        if (req.file) {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            // On met à jour le livre
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Livre modifié !" }))
              .catch((error) => res.status(400).json({ error }));
          });
        } else {
          // Pas de nouvelle image, on met à jour
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Livre modifié !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérification : utilisateur créateur du livre ?
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Non autorisé" });
      } else {
        // On supprime l'image du serveur
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          //  supprime le livre de la base
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
