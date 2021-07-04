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
const router = express.Router();
var PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine', 'html');
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/home.html'));
});

router.get('/rooms', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/rooms.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/register.html'));

  
});

app.post('/send', (req, res) => {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'web322joaovictor@gmail.com',
      pass: 'web322joao'
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
    }else{
      res.sendFile(path.join(__dirname+'/views/new_user.html'));
    }
});
});


router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/login.html'));
});

app.use('/', router);

function onHttpStart() {
  console.log("The server is running... to port " + PORT + ".");
}

app.listen(PORT, onHttpStart);