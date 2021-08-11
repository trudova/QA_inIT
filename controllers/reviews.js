const Question = require("../models/question"); 
const Review = require("../models/review");


module.exports.createReview = async(req,res)=>{
    const {id} = req.params;
    const question = await Question.findById(id);
    const review = new Review(req.body.review);
    review.author=req.user._id;
    console.log(review)
    question.reviews.push(review);
    await review.save();
    await question.save();
     req.flash("success", "your review was added, thank you for participation!");
    res.redirect(`/questions/${question._id}`)

} 

module.exports.deleteReview  = async(req, res)=>{
    const {id, reviewId} = req.params;
await Question.findByIdAndUpdate(id,{$pull:{reviews: reviewId}});
await Review.findByIdAndDelete(reviewId);
req.flash("success", "your review was deleted!");
res.redirect(`/questions/${id}`);
}