const express = require('express');
const API = require('./API.js');

var app = express();
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(express.static(__dirname + "/public"));
app.use(function (req, res, next) {
    if (req.is('text/*')) {
        req.text = '';
        req.setEncoding('utf8');
        req.on('data', function (chunk) { req.text += chunk });
        req.on('end', next);
    } else {
        next();
    }
});

app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; Press CTRL-C to terminate.');
});

// handle routes
app.get('/', function (req, res) {
    res.render('/public/index.html');
});


app.post('/v1/MoveMoney/', function (req, res) {
    let amount = req.body.amount;
    let person = req.body.person;
    API.MoveTheCash(1).then( (response) => {
        console.log(response);
        console.log(amount);
        res.send(response.transferRequestStatus);
    
    });
});
