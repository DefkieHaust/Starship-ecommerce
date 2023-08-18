const express = require('express');
const {
    getAllProducts,
    createProduct,
    getProductDetails,
    updateProduct,
    deleteProduct,
    createProductReview,
    getProductReviews,
    deleteReview
} = require('../controllers/productController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const requireFields = require('../middleware/requireFields');
const router = express.Router();


router.route('/products')
    .get(getAllProducts)
    .post(
        isAuthenticatedUser,
        authorizeRoles('admin'),
        requireFields(
            "name",
            "description",
            "price",
            "category"
        ),
        createProduct
    )

router.route('/products/:id')
    .get(getProductDetails)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)

router.route('/products/:id/reviews')
    .get(getProductReviews)
    .put(
        isAuthenticatedUser,
        requireFields("rating"),
        createProductReview
    )
    .delete(isAuthenticatedUser, deleteReview)

module.exports = router;
