const pg = require('pg');
const express = require('express');
const db = require(__dirname + '/server/models/db.js');

const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

// Set up the express app
const app = express();

// Log requests
app.use(logger('dev')); // anytime we get a request from the client -> log it to the console

// Parse incoming requests data
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static('static')) // loads static files

app.use(session({
    secret: "very very very tight security", // your settings on how sessions be configure
    resave: true,
    saveUninitialized: false
}));

app.set('views', __dirname + '/server/views'); 
app.set('view engine', 'pug');


//GET REQUESTS
app.get('/login', (req, res) => {
	res.render('login')
});

app.get('/profile', (req, res) => {
	const user = req.session.user
  if(user) {
    db.User.findOne({where: {name : req.session.user.name}, include: [{model: db.Food}]})
	   .then(user => {
        console.log(user)
        res.render('profile', {user: user})
      })//then
  }//if
  else{res.redirect('/login')
  }
});

app.get('/signup', (req,res) => {
    res.render('signup')
})

//POST REQUESTS
app.post('/profile', (req,res) => {
  if(req.body.name.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Plese fill type in your food item"));
    return;
  }
  if(req.body.time.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Plese fill in a time"));
    return;
  }
  else {
    db.Food.create ({
      name: req.body.name,
      time: req.body.time,
      quantity : req.body.quantity,
      userId : req.session.user.id
    })
  }
  res.redirect('/profile')
})


// Signup Input
app.post('/signup', (req, res) => {
  console.log('//////////////')
  console.log(req.body)
  bcrypt.hash(req.body.password, 8, function(err, hash) {
    if(err) {
      console.log(err);
    }else{

        db.User.create ({
        name: req.body.name,
        password: hash,
        email: req.body.email,
      })
        .then((user)=> {
          req.session.user = user;
          res.redirect('/profile')
      })
    }//else
  })//bcrypt
});//app/post  mo

//login input
app.post('/login', (req,res)=> {
  console.log('reached')
  if(req.body.name.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Plese fill type in your user name"));
    return;
  }
  if(req.body.password.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Please fill out your password"));
    return;
  }
  else {  
    console.log('searching user')
    db.User.findOne({
      where: {
      name: req.body.name
      }
  }).then(function(user) {
    bcrypt.compare(req.body.password, user.password, function(err, hash) {
      if(true) {
        req.session.user = user;
        res.redirect('/profile')
     }else{
        res.redirect('/?message=' + encodedURIComponent("Invalid user name and/or password."))
      }  
    },(err) => {
      res.redirect('/?message=' + encodedURIComponent(err))
      })//(err)
    })//then
  }//else
})//app.post

// Make connection with the server
app.listen(3000,() => {
    console.log('Server hast started on port 3000')
});

// app.post('/login', (req, res) => {
//     console.log(req.body)
//     if(req.body.name.length === 0) {
//         response.render('login', {
//         message1: "Please fill out your username."
//     });
//         return;

//     } else if
//     (req.body.password.length === 0) {
//         res.render('login', {
//         message2: "Please fill out your password."
//     });
//         return;
//     }
//     db.User.findOne({
//         where: {
//             name: req.body.name 
//         }
//     }).then(function (user) {
//         console.log(user)
//         if (user) {
//              bcrypt.compare(req.body.password, user.password, (err, result) => {
//                  if(result === true){
//                     req.session.user = user;
//                     res.redirect('/profile');
//                   }
//              });
//         } else {
//           res.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
//         }
//     }, function (error) {
//         res.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
//     });
// });

// app.post('/login', (req,res)=> {
//   if(req.body.name.length === 0) {
//     res.redirect('/?message=' + encodeURIComponent("Plese fill type in your user name"));
//     return;
//   }
//   if(req.body.password.length === 0) {
//     res.redirect('/?message=' + encodeURIComponent("Please fill out your password"));
//     return;
//   }
//   else {  
//     db.User.findOne({
//       where: {
//        name: req.body.name
//       }
//     })//findone
//   }//else
//   .then(log => {
//       console.log(User.name)
//     }).then(function(user) {
//       bcrypt.compare(req.body.password, user.password, function(err, hash) {
//     if(true) {
//      req.session.user = user;
//       res.redirect('/profile')
//     } else {
//       res.redirect('/?message=' + encodedURIComponent("Invalid user name and/or password."))
//     }  
//     },(err) => {
//       res.redirect('/?message=' + encodedURIComponent(err))
//       })//(err)
//     })//then
// });//app.post