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
    saveUnitialized: false
}));

app.set('views', __dirname + '/server/views'); 
app.set('view engine', 'pug');


//GET REQUESTS
app.get('/login', (req, res) => {
	res.render('login')
});

app.get('/profile', (req, res) => {
	res.render('login', {
		user: req.session.user
	})
});


//POST REQUESTS

// Signup Input
app.post('/signup', (request, response) => {
    bcrypt.hash(request.body.password, 8, function(err, hash) {
        if (err) { console.log(err) }
        let newUser = db.User.create({
            name: request.body.name,
            email: request.body.email,
            password: hash
        }).then( f =>{
            response.redirect('signup')
        })
    })
})

//login input
app.post('/login', (request, response) => {
    if(request.body.email.length === 0) {
        response.render('login', {
        message1: "Please fill out your email address."
    });
        return;

    } else if
    (request.body.password.length === 0) {
        response.render('login', {
        message2: "Please fill out your email password."
    });
		return;
	}
	db.User.findOne({
		where: {
			name: request.body.name,  
		}
	}).then(function (user) {
		if (user) {
             bcrypt.compare(request.body.password, user.password, (err, result) => {
                 if(result === true){
                    request.session.user = user;
			        response.redirect('profile');
                  }
             });
		} else {
			response.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
		}
	}, function (error) {
		response.redirect('/login?message=' + encodeURIComponent("Invalid email or password."));
	});
});