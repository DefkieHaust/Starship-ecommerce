const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const {
    newOrder,
    getOrders,
    deleteOrder,
    getSingleOrder,
    getAllOrders,
    deleteOneOrder,
    getOneOrder,
    updateOneOrder
} = require('../controllers/orderController');

router.route('/user/orders')
    .get(isAuthenticatedUser, getOrders)
    .post(isAuthenticatedUser, newOrder)

router.route('/user/orders/:id')
    .delete(isAuthenticatedUser, deleteOrder)
    .get(isAuthenticatedUser, getSingleOrder)

router.route('/orders')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders)

router.route('/orders/:id')
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOneOrder)
    .get(isAuthenticatedUser, authorizeRoles('admin'), getOneOrder)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOneOrder)


module.exports = router;