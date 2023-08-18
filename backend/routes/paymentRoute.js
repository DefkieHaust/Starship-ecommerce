const express = require('express');
const router = express.Router();
const { isAuthenticatedUser } = require('../middleware/auth');
const { sendPaymentsApiKey } = require('../controllers/paymentController');

router.route('/payments/api-key')
    .get(isAuthenticatedUser, sendPaymentsApiKey)

module.exports = router;