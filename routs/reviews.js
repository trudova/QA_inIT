const express = require("express");
const router = express.Router({mergeParams: true});
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Question = require("../models/question"); 
const Review = require("../models/review");
// const { reviewSchema} = require("../schemas.js");
const {validateReview, isLoggedIn, isAuthor, isReviewAuthor} = require("../middleware");



// =================routs===================================
router.post("/",isLoggedIn, validateReview,catchAsync(reviews.createReview ));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;