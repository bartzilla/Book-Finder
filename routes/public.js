'use strict';

var express = require('express');

// Globals
var router = express.Router();

// Routes
router.get('/*', function(req, res) {
  res.sendfile('./client/index.html');
});

router.get('/pricing', function(req, res) {
  res.render('pricing');
});

router.get('/docs', function(req, res) {
  res.render('docs');
});

// Exports
module.exports = router;