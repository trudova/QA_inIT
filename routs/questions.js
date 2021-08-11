const express = require("express");
const router = express.Router();
const questions = require("../controllers/questions");
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, validateQuestion, isAuthor} = require("../middleware");
const multer  = require("multer");
const {storage}= require("../cloudinary");
const upload = multer({storage});

router.route("/")
.get( catchAsync(questions.index))
.post(isLoggedIn, upload.array("image"), validateQuestion, catchAsync(questions.createQuestion));



router.get("/new", isLoggedIn, questions.renderNewForm);

router.route("/:id")
.get( catchAsync( questions.showQuestion))
.put(isLoggedIn, isAuthor,upload.array("image"), validateQuestion, catchAsync(questions.editQuestion))
.delete( isAuthor, catchAsync( questions.deleteQuestion));


router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(questions.renderEditForm));





module.exports = router;