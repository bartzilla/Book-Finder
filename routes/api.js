var express = require('express');
var bodyParser = require('body-parser');

var router = express.Router();
router.use(bodyParser.json());

var Book = require('../models/Book');

router.get('/books', function(req, res){
  Book.find(function(err, books){
    res.send(books)
  });
});

router.post('/books', function(req, res) {
  // if (!req.body || !req.body.phoneNumber) {
  //   return res.status(400).json({ error: 'phoneNumber is required.' });
  // } else if (!BTC_EXCHANGE_RATE) {
  //   return res.status(500).json({ error: "We're having trouble getting the exchange rates right now. Try again soon!" });
  // } else if (req.user.customData.balance < COST_PER_QUERY) {
  //   return res.status(402).json({ error: 'Payment required. You need to deposit funds into your account.' });
  // }

});

module.exports = router;
