const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { upload, optimizeImage } = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

// Routes publiques
router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getOneBook);

// Routes protégées
router.post("/", auth, upload, optimizeImage, bookCtrl.createBook);
router.put("/:id", auth, upload, optimizeImage, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
