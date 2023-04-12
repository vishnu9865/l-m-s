//setup dotenv
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');
const { request } = require('express');

const app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.MY_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI);
//mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get('/', (req, res) => {
//     res.render('home');
// });

const OrderSchema = new mongoose.Schema({
  user: String,
  fromlocationname: String,
  fromlatitude: Number,
  fromlongitude: Number,
  tolocationname: String,
  tolatitude: Number,
  tolongitude: Number,
  transportmode: String,
  price: Number,
  orderstatus: String,
  accepteduser: String
});

let Order = mongoose.model('Order', OrderSchema);

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.get('/home', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('home', {
      title: 'Home',
      user: req.user
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/order', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('order', { title: 'New Order', user: req.user, mapkey: process.env.MAP_API_KEY });
  } else {
    res.redirect('/login');
  }
});

app.get('/order/accept/:id', (req, res) => {
  console.log(req.params.id);
});

app.get('/order-all', (req, res) => {
  if (req.isAuthenticated()) {
    Order.find({ 'orderstatus': 'open' }, (error, data) => {
      res.render('display', {
        title: 'All Orders',
        user: req.user,
        orderlist: data,
        heading: 'Browse Orders'
      });
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/order-mine', (req, res) => {
  if (req.isAuthenticated()) {
    Order.find({ 'user': req.user.username }, (error, data) => {
      res.render('display', {
        title: 'All Orders',
        user: req.user,
        orderlist: data,
        heading: 'My Orders'
      });
    });
  } else {
    res.redirect('/login');
  }
});

// app.get('/secrets', function (req, res) {
//     User.find({'secret':{$ne:null}}, ( err, results) => {
//         if( err) {
//             console.log(err);
//         } else if( results) {
//             console.log( results);
//             res.render('secrets', {usersWithSecrets: results});
//         }
//     });
// });

app.get('/submit', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('submit');
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect('/login');
  });
});

app.post('/order', (req, res) => {
  if (req.isAuthenticated()) {
    const newOrder = new Order({
      user: req.user.username,
      fromlocationname: req.body.fromlocationName,
      fromlatitude: req.body.fromlatitude,
      fromlongitude: req.body.fromlongitude,
      tolocationname: req.body.tolocationName,
      tolatitude: req.body.tolatitude,
      tolongitude: req.body.tolongitude,
      transportmode: req.body.transportmode,
      price: req.body.price,
      orderstatus: "open",
      accepteduser: "none"
    });
    newOrder.save();
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
});

app.post('/register', (req, res) => {
  User.register({ username: req.body.username }, req.body.password, (err) => {
    if (err) {
      console.log(err);
      res.redirect('/register');
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/home');
      });
    }
  });
});

app.post('/login', (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('/order-mine');
      });
    }
  });
});

// start the server
app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on port 3000.');
});