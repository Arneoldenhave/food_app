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
        //arrayOfTimes needs to be stringified, otherwise you get [Object Object]
        res.render('profile', {user: user, plannedFoodTimes: JSON.stringify(req.session.user.arrayOfTimes)})
      })//then
  }//if
  else{res.redirect('/login')
  }
});

app.get('/signup', (req,res) => {
    res.render('signup')
})

//POST REQUESTS
app.post('/profile', bodyParser.urlencoded({extended:true}), function (req, res) {
    const user = req.session.user
    const stuffToMatch = req.body.time.match(/[0-9]{2}:[0-9]{2}/g) && //e.g. 12:00
          req.body.quantity.match(/[0-9]{3}[ ]*gr/g ||                //e.g. 500 gr
           /[0-9]*.[0-9]/g || /[0-9]*/g) ||                                //e.g. 10.2 of 10
          req.body.healthy.match(/[1-5]/g);                        //i.e. 1, 2, 3, 4 of 5 of niks
    if(stuffToMatch){
      console.log('this is the right format') 
                
      let newFood = db.Food.create({
          name : req.body.name,
          time : req.body.time,
          quantity: req.body.quantity,
          healthy: req.body.healthy,
          userId : user.id
      })
      .then(food => {
        // req.session.user.arrayOfTimes wordt aangemaakt in app.post('signup', ...) rond regel 135
        // adding foodname and the time to eat it to the timer array so we can check it client-side 
        req.session.user.arrayOfTimes.push({
          foodName: req.body.name, 
          time: req.body.time,
        })
        res.redirect('/profile') 
      })
    }
    else{
      console.log('Please log time like so: 15:00 AND quantity like so: 500 gr OR UNITS like so: 1.5 OR: 2')
    }//else
})//post


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
        req.session.user.arrayOfTimes = [];
        console.log('logging req.sessios.user.arrayOfTimes')
        console.log(req.session.user.arrayOfTimes)
  
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
    //TO DO: get hashed password from the database and then do bcrypt compare
    bcrypt.compare(req.body.password, user.password, function(err, hash) {
      if(true) {
        req.session.user = user;
        req.session.user.arrayOfTimes= []
        // console.log('logging req.sessios.user.arrayOfTimes')
        // console.log(req.sessios.user.arrayOfTimes)
  
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

