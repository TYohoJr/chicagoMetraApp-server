var express = require("express");
var app = express();
var path = require('path')
require('dotenv').config();
var bodyParser = require('body-parser');
var request = require('request');
const MongoClient = require('mongodb').MongoClient;
var bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const assert = require('assert');

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds139645.mlab.com:39645/chicago-metra-app`
const dbName = 'chicago-metra-app';
const client = new MongoClient(url, { useNewUrlParser: true });

var db;

client.connect(function (err) {
    assert.equal(null, err);
    db = client.db(dbName);
    console.log('Connected successfully to database');
})

function verifyToken(req, res, next) {
    var token = req.body.token;
    if (token) {
        jwt.verify(token, 'Secret', (err, decode) => {
            if (err) {
                res.send('Wrong Token');
            } else {
                res.locals.decode = decode;
                next();
            }
        })
    } else {
        console.log('No Token');
        res.send('No Token');
    }
}

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080, () => {
    var curPort = process.env.PORT;
    if (curPort === undefined) {
        console.log(`listening on localhost://8080`)
        curPort = "localhost://8080"
    } else {
        let d = new Date();
        console.log(`listening on ${curPort} at ${d}`)
    }
})

app.post('/signUpData', (req, res) => {
    if (req.body.username.length && req.body.password.length) {
        db.collection('users').find({ username: req.body.username }).toArray((err, user) => {
            if (user.length) {
                res.json('This username already exists')
            } else {
                bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
                    db.collection('users').save({
                        username: req.body.username,
                        password: hash,
                        savedTrains: [],
                        dateCreated: req.body.dateCreated
                    }, (err, result) => {
                        if (err) {
                            res.json("Failed")
                            return console.log(err);
                        } else {
                            res.json("Sign Up Successful")
                            console.log('saved to database');
                        }
                    });
                });
            }
        })
    } else {
        res.json('Error: username or password can\'t be blank')
    }
});

app.post('/changePassword', (req, res) => {
    db.collection('users').find({ username: req.body.username }).toArray((err, user) => {
        if (user.length) {
            bcrypt.compare(req.body.oldPassword, user[0].password, function (err, resolve) {
                if (resolve) {
                    bcrypt.hash(req.body.newPassword1, saltRounds, function (err, hash) {
                        db.collection('users').updateOne(
                            { username: req.body.username },
                            {
                                $set:
                                {
                                    password: hash
                                }
                            }
                        )
                        if (err) {
                            res.json("Failed")
                            console.log(err);
                        } else {
                            res.json('Successfully updated password')
                            console.log(`password updated for ${req.body.username}`);
                        }
                    });
                } else {
                    res.json("Wrong password")
                }
            });
        } else {
            res.json('Error: Please log out and back in')
        }
    })
});

app.post("/userLogIn", (req, res) => {
    db.collection("users").find({ username: req.body.username }).toArray((err, user) => {
        if (!user.length) {
            res.json({
                message: `Login failed!`
            });
        } else if (err) {
            res.json({
                message: "Login failed!"
            });
        } else {
            // Un-hash the password to verify login
            bcrypt.compare(req.body.password, user[0].password, function (err, resolve) {
                if (resolve === true) {
                    // Upon successful login, assigns the user a token
                    var token = jwt.sign(req.body.username, ('Secret'), {
                    });
                    res.json({
                        message: "Login successful!",
                        myToken: token,
                        user: user[0],
                        item: user
                    });
                    console.log(`Sign in successful from ${req.body.username}`)
                } else if (resolve === false) {
                    res.json({
                        message: "Login failed!",
                    })
                }
            });
        }
    })
});

app.post('/access-api', (req, res) => {
    console.log(req.body)
    request(
        {
            url: `https://${process.env.API_USERNAME}:${process.env.API_PASSWORD}@gtfsapi.metrarail.com/gtfs/${req.body.url}`,
            json: true
        },
        function (error, response, body) {
            res.json({
                body
            })
        }
    );
})
