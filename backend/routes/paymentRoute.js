const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const {
    sendPaymentsApiKey,
    paymentUpdateListener
} = require('../controllers/paymentController');

router.route('/payments/api-key')
    .get(isAuthenticatedUser, sendPaymentsApiKey)

router.route('/payments/webhook')
    .post(paymentUpdateListener)

module.exports = router;