const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

// Routes publiques (pas besoin d'être connecté)
router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getOneBook);

// Routes protégées (besoin d'être connecté)
router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
