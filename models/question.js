const mongoose = require("mongoose");
const  Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");

//https://res.cloudinary.com/div355m8n/image/upload/v1628624994/QA_in_IT/cffgnfsbbvx30bxo4ldp.jpg 

const ImageSchema = new Schema({
    url: String,
    filename: String
        
});
ImageSchema.virtual("thumbnail").get(function(){
  return  this.url.replace("/upload", "/upload/w_150")
})

const QuestionSchema = new Schema({
    title: String,
    images: [ImageSchema],
    category: String,
    answer: String,
    author:
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    reviews:[
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    
});

QuestionSchema.post("findOneAndDelete", async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

 module.exports= mongoose.model("Question", QuestionSchema);