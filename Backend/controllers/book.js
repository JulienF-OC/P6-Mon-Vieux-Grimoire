const Book = require("../models/Book");
const fs = require("fs");

// Créer un livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la création du livre.", error })
    );
};

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération des livres.", error })
    );
};

// Récupérer un livre spécifique
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé." });
      }
      res.status(200).json(book);
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la récupération du livre.", error })
    );
};

// Modifier un livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé." });
      }

      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé." });
      }

      // Si nouvelle image, on supprime l'ancienne
      if (req.file) {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.error("Erreur suppression image:", err);

          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Livre modifié !" }))
            .catch((error) =>
              res
                .status(500)
                .json({
                  message: "Erreur lors de la modification du livre.",
                  error,
                })
            );
        });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) =>
            res
              .status(500)
              .json({
                message: "Erreur lors de la modification du livre.",
                error,
              })
          );
      }
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la recherche du livre.", error })
    );
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé." });
      }

      if (book.userId != req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé." });
      }

      const filename = book.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.error("Erreur suppression image:", err);

        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch((error) =>
            res
              .status(500)
              .json({
                message: "Erreur lors de la suppression du livre.",
                error,
              })
          );
      });
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la recherche du livre.", error })
    );
};

// Noter un livre
exports.rateBook = (req, res, next) => {
  const rating = req.body.rating;
  const userId = req.auth.userId;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: "La note doit être entre 0 et 5." });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé." });
      }

      const existingRating = book.ratings.find((r) => r.userId === userId);
      if (existingRating) {
        return res
          .status(409)
          .json({ message: "Vous avez déjà noté ce livre." });
      }

      book.ratings.push({ userId: userId, grade: rating });

      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      book.averageRating = sumRatings / totalRatings;

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) =>
          res
            .status(500)
            .json({
              message: "Erreur lors de la sauvegarde de la note.",
              error,
            })
        );
    })
    .catch((error) =>
      res
        .status(500)
        .json({ message: "Erreur lors de la recherche du livre.", error })
    );
};

// Récupérer les 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(200).json(books))
    .catch((error) =>
      res
        .status(500)
        .json({
          message: "Erreur lors de la récupération des meilleurs livres.",
          error,
        })
    );
};
