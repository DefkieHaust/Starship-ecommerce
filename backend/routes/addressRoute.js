const express = require('express');
const router = express.Router();
const {
    createAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    getSingleAddress,
    getAllAddresses,
    updateOneAddress,
    deleteOneAddress,
    getOneAddress
} = require('../controllers/addressController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const requireFields = require('../middleware/requireFields');

router.route('/user/addresses')
    .get(isAuthenticatedUser, getAddresses)
    .post(
        isAuthenticatedUser,
        requireFields("address", "city", "state", "country", "zipCode"),
        createAddress
    )

router.route('/user/addresses/:id')
    .get(isAuthenticatedUser, getSingleAddress)
    .put(isAuthenticatedUser, updateAddress)
    .delete(isAuthenticatedUser, deleteAddress)

router.route('/addresses')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getAllAddresses)

router.route('/addresses/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateOneAddress)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOneAddress)
    .get(isAuthenticatedUser, authorizeRoles('admin'), getOneAddress)


module.exports = router;