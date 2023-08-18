const express = require('express');
const router = express.Router();
const { paymentUpdateListener } = require('../controllers/paymentController')  
const bodyParser = require('body-parser');


router.route("/webhook/stripe")
    .post(bodyParser.raw({ type: 'application/json' }), paymentUpdateListener)

module.exports = router;