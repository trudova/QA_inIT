const Question = require("../models/question"); 
const Review = require("../models/review");
const User = require("../models/user");

module.exports.renderRegisterForm =(req, res)=>{
    res.render("users/register");
}

module.exports.createUser =  async(req, res)=>{
    try{
 const {email, username, password} = req.body;
 const user = new User({email, username});
const registeredUser= await User.register(user, password);
req.login(registeredUser, err=>{
    if(err) return next(err);
    req.flash("success","Welcome to aur interview preporation community");
    res.redirect("/questions");
});

    }catch{
       req.flash("error","email ore user name already exists, try again"); 
       res.redirect("/register")
    }
}

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login");
}



module.exports.loginUser= (req,res)=>{
    req.flash("success", "welcome back");
    const redirectUrl =  req.session.returnTo || "/questions";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser= (req,res)=>{
    req.logout();
    res.redirect("/");
}

