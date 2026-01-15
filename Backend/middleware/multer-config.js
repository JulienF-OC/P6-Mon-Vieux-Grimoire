const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

// Types acceptés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Config pour stocker temporairement en mémoire
const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single("image");

// optimise l'image avec Sharp
const optimizeImage = (req, res, next) => {
  // Si pas d'image, on passe au suivant
  if (!req.file) {
    return next();
  }

  // Génération du nom de fichier
  const name = req.file.originalname.split(" ").join("_").split(".")[0];
  const timestamp = Date.now();
  const filename = `${name}_${timestamp}.webp`;

  // destination
  const outputPath = path.join("images", filename);

  // Optimisation avec Sharp
  sharp(req.file.buffer)
    .resize({
      width: 500,
      height: 500,
      fit: "cover",
    })
    .webp({ quality: 80 })
    .toFile(outputPath)
    .then(() => {
      // On modifie req.file pour que le controller utilise le bon nom de fichier
      req.file.filename = filename;
      next();
    })
    .catch((error) => {
      console.error("Erreur lors de l'optimisation de l'image:", error);
      res.status(500).json({ error: "Erreur lors du traitement de l'image" });
    });
};

// On exporte
module.exports = { upload, optimizeImage };
