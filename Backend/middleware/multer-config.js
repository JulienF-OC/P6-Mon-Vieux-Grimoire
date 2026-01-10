const multer = require("multer");

// Types MIME acceptés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

// Configuration du stockage
const storage = multer.diskStorage({
  // Destination : dossier images/
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // Nom du fichier : nom original + timestamp + extension
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_").split(".")[0];
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
