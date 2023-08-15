const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
    newOrder,
    getOrders,
    deleteOrder,
    getSingleOrder
} = require('../controllers/orderController');

router.route('/user/orders')
    .get(isAuthenticatedUser, getOrders)
    .post(isAuthenticatedUser, newOrder)

router.route('/user/orders/:id')
    .delete(isAuthenticatedUser, deleteOrder)
    .get(isAuthenticatedUser, getSingleOrder)


module.exports = router;