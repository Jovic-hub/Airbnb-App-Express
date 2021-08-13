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
var multer = require('multer');
const methodOverride = require('method-override')

var User = require('./models/user');
var Room = require('./models/rooms');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
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

app.set('view engine', '.hbs');
app.engine('handlebars', exphbs({extname: '.hbs'}));
router.get('/', (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
  }
res.render(__dirname+'/views/home.hbs',{logged:check});
});

var storage = multer.diskStorage({
    destination: function (req, file, cb)  {
        cb(null, (__dirname+'/public/uploads/images'))
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
});
const upload = multer({ storage: storage}); //10MB

////////////// REGISTER AND LOGOUT
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

app.get('/new_room', (req,res)=>{
  res.render(__dirname+'/views/new_room.hbs');
})



////////////////////ROOMS

router.get('/rooms', async (req, res) => {
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
    console.log(req.session.user.username)
  }
  try{
    const rooms = await Room.find((err, docs) =>{
      if(!err){
        res.render(__dirname+'/views/rooms.hbs',{
          logged:check,
          list: docs,
        });
      }else{
        console.log(err)
      }
    });
  }catch(err){
    res.json({message:err});
  }
});

app.post('/form-search', (req,res) =>{
  check = true;
  if (req.session.user && req.cookies.user_sid) {
    check = false;
    check_two = false;
    console.log(req.session.user.username)
  }
    const rooms = Room.find((err, docs) =>{
      let rooms_searched = [];
      for(let i = 0; i < docs.length; i++){
        console.log(docs[i].location)
        if(docs[i].location == req.body.where){
          rooms_searched.push(docs[i]);
        }
      }
      if(rooms_searched.length < 1){
        req.flash('no_found', 'We could not find any place in this location: ' + req.body.where)
        req.flash('currently', 'Currently locations avalaible:')
        for(let i = 0; i < docs.length; i++){
          req.flash('list_available', docs[i].location + '\n');
        }
        res.redirect('/rooms');
      }else{
        res.render(__dirname+'/views/rooms.hbs',{
          list: rooms_searched,
          logged:check
        });
        console.log(rooms_searched);
      }
    });
})
app.get('/edit/:id', async (req, res)=>{
  let room = await Room.findById(req.params.id)
  if(req.session.user == undefined){
    req.flash('error', 'Please, log-in first to try to interact with edit and delete.');
    res.redirect('/rooms')
  }else{
    if(room.email == req.session.user.username){
      res.render('edit', {docs:room})
    }else{
      req.flash('error', 'Just the owner of the room can edit or delete it.');
      res.redirect('/rooms')
    }
  }
});

app.get('/view/:id', async(req,res)=>{
  if(req.session.user == undefined){
    req.flash('error', 'Please, log-in first to try to interact with edit, delete or view it');
    res.redirect('/rooms')
  }else{   
    let room = await Room.findById(req.params.id)
    res.render('book', {docs:room})
    app.post('/price', (req,res)=>{
      console.log(req.body.in)
      console.log(req.body.out)
      var date1 = new Date(req.body.in);
      var date2 = new Date(req.body.out);
      var Difference_In_Time = date2.getTime() - date1.getTime();
      var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      var final_price = Difference_In_Days * room.price
      var datee1 = req.body.in
      var datee2 = req.body.out
      res.render('book', {docs:room, price:final_price})
      app.post('/book-send', (req, res) => {
        console.log(req.session.user.username)
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.USER,
            pass: process.env.PASS
          }
        });     
        let mailOptions  = {
          from: 'web322joaovictor@gmail.com',
          to: req.session.user.username,
          subject: 'Booking Confirmation',
          text: 'Thanks for booking the Room: ' + room.title +'\n' + 'Final price: $'+ final_price + '\n'
        }      
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }else{
            res.render(__dirname+'/views/confirmation.hbs', {name: req.session.user.username, in: datee1, out:datee2, price:final_price, docs: room});
          }
      })});  
    });  
  }
})
app.put('/edit_form/:id', async (req,res)=>{
  let room = await Room.findById(req.params.id)
  console.log(room)
  console.log(req.body)
  console.log(room.title);
  room.title = req.body.room_title;
  console.log(room.title);
  room.price  = req.body.room_price;
  room.description  = req.body.room_description;
  room.location = req.body.room_location;
  console.log(req.body)
  try{
    room = await room.save();
  }catch(err){
    console.log(err);
  }
})

app.delete('/delete/:id', async (req, res) =>{
  let room = await Room.findById(req.params.id)
  if(req.session.user == undefined){
    req.flash('error', 'Please, log-in first to try to interact with edit, delete or view it');
    res.redirect('/rooms')
  }else{
    if(room.email == req.session.user.username){
      await Room.findByIdAndRemove(req.params.id);
      res.render(__dirname+'/views/home.hbs');
    }else{
      req.flash('error', 'Just the owner of the room can edit or delete it.');
      res.redirect('/rooms')
    }
  }
})
app.post('/new_room_form', upload.single('room_image'), (req,res) => {
  console.log(req.body);
  var room = new Room({
    title: req.body.room_title, 
    price: req.body.room_price,
    description: req.body.room_description,
    location: req.body.room_location,
    photo: req.file.filename,
    email: req.body.email
  });
  room.save();
  req.flash('succ', 'Your room was added sucessfully, you can either search here or goes directly to the rooms.')
  res.redirect('/');
})


////// LOGIN
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
          res.render(__dirname+'/views/home.hbs');
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