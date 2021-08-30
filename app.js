if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}


const express = require("express");
const path = require("path");
const mongoose = require("mongoose"); 
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const usersRouts = require("./routs/users");
const questionsRouts = require("./routs/questions");
const reviewsRouts = require("./routs/reviews");
const https = require("https");
const mongoSanitize = require('express-mongo-sanitize');
const catchAsync = require("./utils/catchAsync");

const MongoStore = require('connect-mongo');


// =============DB ========================

// const dbUrl = process.env.DB_URL;
const dbUrl =process.env.DB_URL || "mongodb://localhost:27017/QA-DB";
//"mongodb://localhost:27017/QA-DB"
mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex:true, useUnifiedTopology: true, useFindAndModify:false });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function(){
    console.log("data base connected");
})
// ============= end of DB ========================
const app = express();

app.engine("ejs",ejsMate);

// ==================setings=====================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// ================== end of setings=====================


// ================middle were use===============
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
const store = MongoStore.create({mongoUrl: dbUrl,touchAfter: 24 * 3600,secret:secret  })

store.on("error", function(e){
    console.log("session store error ", e);
})

const sessionConfig = {
    store:store,
    name: "session",
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// ================end ofmiddle were use===============


// ================routs=======================
app.get("/", (req, res)=>{
  res.render("home");
});
app.get("/about", (req, res)=>{
    res.render("about");
})
app.post("/about", catchAsync(async (req, res)=>{
    const {fullname, email, phone} = req.body;
    const data ={
        members:[
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fullname,
                    PHONE: phone
                }
            }
        ]
    }
    const jsonData = JSON.stringify(data);
    const mName=process.env.MAILCHIMP_NAME;
    const mKey=process.env.MAILCHIMP_KEY;
    const url= `https://us6.api.mailchimp.com/3.0/lists/${mName}`;
    const options ={
        method: "POST",
        auth: mKey
    }
   const request= await https.request(url, options, (response)=>{
        response.on("data", (data)=>{
           
        })
    });
    
await request.write(jsonData);
request.end();
req.flash("success", "Thank you for reaching out to me, I'll get back to you as soon as posible!");
res.redirect("/")

}));



////========================use of user routs=============
app.use("/", usersRouts)
////========================use of question routs=============
app.use("/questions", questionsRouts);
////========================use of review routs=============
app.use("/questions/:id/reviews", reviewsRouts);


app.all("*", (req, res, next)=>{
   next(new ExpressError("Page not found", 404));
})
// ================ end of routs=======================


// =========error handeling====================
app.use((err, req,res, next)=>{
    const {statusCode =500, message ="somthing went wrong"} = err;
    if(!err.message) err.message ="SOMETHING WENT WRONG";
  res.status(statusCode).render("error",{err});
});

const port = process.env.PORT ||3000
app.listen(port, ()=>{
    console.log(`server running on port ${port}`)
}
)