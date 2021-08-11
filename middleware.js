const {questionSchema, reviewSchema} = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Question = require("./models/question"); 
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateQuestion = (req, res, next)=>{
const {error} = questionSchema.validate(req.body);
if(error){
    const msg = error.details.map(el=> el.message).join(", ")
    throw new ExpressError(msg, 400)
}else{
    next();
}
}


module.exports.isAuthor = async(req,res,next)=>{
  const {id} = req.params;
  const question = await Question.findById(id);
   if(!question.author.equals(req.user._id)){
   req.flash("error", "forbidden, you dont have perission for this action");
   return  res.redirect(`/questions/${id}`);
   }
   next();

}
module.exports.isReviewAuthor = async(req,res,next)=>{
  const {id, reviewId} = req.params;
  const review = await Review.findById(reviewId);
   if(!review.author.equals(req.user._id)){
   req.flash("error", "forbidden, you dont have perission for this action");
   return  res.redirect(`/questions/${id}`);
   }
   next();

}

module.exports.validateReview =(req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=> el.message).join(", ")
         throw new ExpressError(msg, 400)
    }else{
        next();
    }
}
