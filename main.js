/*
Student: Joao Victor Fernandes dos Santos
StudentId: jvfernandes-dos-sant
Student Numbeer: 155858194
Course: WEB 322 
Professor: George Kougioumtzoglou
*/
var express = require("express");
var app = express();
const path = require('path');
const nodemailer = require('nodemailer')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require("express-session")
var flash = require('express-flash');
const router = express.Router();
var exphbs = require('express-handlebars')
var PORT = process.env.PORT || 8080;
require("dotenv").config()

var User = require("./controllers/user.js");
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(
  session({
    key: "user_sid",
    secret: "gliscorMyFavoritePokemon",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);
app.engine('handlebars', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');
router.get('/', (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
  }
  res.render(__dirname+'/views/home.hbs',{logged:check});
});

router.get('/rooms', (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
  }
  res.render(__dirname+'/views/rooms.hbs',{logged:check});
});

router.get('/register', (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
  }
  res.render(__dirname+'/views/register.hbs',{logged:check});
})

app.get("/logout", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie("user_sid");
    res.redirect("/");
  }
});

app.post('/send', (req, res) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.PASS
    }
  });
  
  let mailOptions  = {
    from: 'web322joaovictor@gmail.com',
    to: req.body.email_address,
    subject: 'Welcome to AirB&B',
    html: "<b>Thanks for joining us, start using AirB&B right now and find the best place for you.</b><br><p>Your account is ready.</p>",
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
});
  var user = new User({
    username: req.body.email_address,
    password: req.body.password,
  });
  user.save((err, info) => {
    if(err){
      res.redirect("/register");
      console.log(err)
    }else{
      console.log(info);
      req.session.user = info;
      res.render(__dirname+'/views/new_user.hbs', {name: req.body.first_name, last_name: req.body.last_name});
    };
  });
});

app.post('/log', async (req, res)=>{
  var username = req.body.email_address,
  password = req.body.password;
  var user = await User.findOne({ username: username }).exec();
  if(user) {
    user.comparePassword(password, (error, match) => {
        if(!match) {
          req.flash('error', 'Please, Provide a valid password.');
          res.redirect('/login')
        }else{
          req.session.user = user;
          res.render(path.join(__dirname+'/views/rooms.hbs'));
        }
    });
  }else{
    req.flash('error', 'Please, Provide a valid username and password.');
    res.redirect('/login')
  }
})
router.get('/login', (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
  }
  res.render(__dirname+'/views/login.hbs',{logged:check});
});

app.use('/', router);

function onHttpStart() {
  console.log("The server is running... to port " + PORT + ".");
}

app.listen(PORT, onHttpStart);