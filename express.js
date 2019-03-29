var express = require("express");
var app = express();
var path = require('path')
require('dotenv').config();
var bodyParser = require('body-parser');
var request = require('request');

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    console.log(`${req.body.request_id} Unique????`)
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
