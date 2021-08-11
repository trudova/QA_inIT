const Question = require("../models/question"); 
const {cloudinary} = require('../cloudinary');

module.exports.index=async (req, res)=>{ //all the q

    const questions = await Question.find({});
    res. render("questions/index",{questions});
};


module.exports.renderNewForm =(req, res)=>{ 

res.render("questions/new");
}

module.exports.createQuestion=  async (req, res)=>{

const question = new Question(req.body.question);
question.images =  req.files.map(file =>({url: file.path, filename: file.filename}));
question.author=req.user._id;
 await question.save();
 req.flash("success", "your question was added!");
 res.redirect(`/questions/${question._id}`);
}

 module.exports.showQuestion =  async (req, res)=>{
const {id} = req.params;
const question = await (await Question.findById(id).populate({
  path:"reviews",
  populate:{
    path:"author"
  }
}).populate("author"));
// console.log(question);
if(!question){
    req.flash("error","No such a question was found!");
  return res.redirect("/questions")
}
  res.render("questions/show", {question});

}
module.exports.renderEditForm = async (req, res)=>{
 const {id} = req.params;
const question = await Question.findById(id);
if(!question){
    req.flash("error","No such a question was found!");
  return res.redirect("/questions")
}
res.render("questions/edit", {question});
} 
module.exports.editQuestion =async(req, res)=>{
   const {id} = req.params;
const question = await Question.findByIdAndUpdate(id, {...req.body.question});
const imgs=req.files.map(file =>({url: file.path, filename: file.filename}));
question.images.push(...imgs);
await question.save();
if(req.body.deleteImages){
  for(let filename of req.body.deleteImages){
  await cloudinary.uploader.destroy(filename);
  }
await question.updateOne({$pull:{images:{filename:{$in: req.body.deleteImages}}}})
}
 req.flash("success", "your question was updated!");
 res.redirect(`/questions/${question._id}`);
}
module.exports.deleteQuestion =async(req, res)=>{
   const {id} = req.params;
   
  await Question.findByIdAndDelete(id);
  req.flash("success", "your question was deleted, thank you for participation!");
  res.redirect("/questions")
}