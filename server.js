// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var apiRoutes = require('./routes/api');
var publicRoutes = require('./routes/public');

// MongoDB
mongoose.connect('mongodb://localhost/rest_books');

// Express
var app = express();
app.use('/', express.static(__dirname + '/client'));


app.use('/', publicRoutes);
app.use('/api', apiRoutes);


// Start server
app.listen(3000);
console.log('API is running on port:3000');
