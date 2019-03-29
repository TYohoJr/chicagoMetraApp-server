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

app.post('/apiTest', (req, res) =>{
    res.json({
        hello: 'helllllo'
    })
})

app.get("/apiTest", (req, res) => {
    request(
        {
            url: `https://128fe84bef8a036dd243efba9da63d92:4c6adc845d845e7e64552abe62b5ddfb@gtfsapi.metrarail.com/gtfs/positions`,
            headers: {
                "username": `128fe84bef8a036dd243efba9da63d92`,
                "password": `4c6adc845d845e7e64552abe62b5ddfb`
            },
            json: true
        },
        function (error, response, body) {
            // Send the array of products back to the front-end
            res.json({
                body: body
            })
        }
    );
})