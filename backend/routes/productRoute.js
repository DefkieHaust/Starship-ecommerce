const express = require('express');
const { getAllProducts, createProduct, getProductDetails, updateProduct, deleteProduct } = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

//productRoute;
router.route('/products')
    .get(getAllProducts)

router.route('/product/new')
    .post(isAuthenticatedUser, authorizeRoles('admin'), createProduct)

router.route('/product/:id')
    .get(getProductDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)

module.exports = router;
