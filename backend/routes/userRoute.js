const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getSingleUser,
    getAllUser,
    updateUser,
    deleteUser,
    deleteAccount
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

router.route("/user/register")
    .post(registerUser);

router.route("/user/login")
    .post(loginUser)

router.route("/user/password/update")
    .put(isAuthenticatedUser, updatePassword)

router.route("/user/password/reset")
    .put(forgotPassword);

router.route('/user/password/reset/:token')
    .put(resetPassword);

router.route("/user/logout")
    .get(isAuthenticatedUser, logoutUser);

router.route("/user")
    .get(isAuthenticatedUser, getUserDetails)
    .put(isAuthenticatedUser, updateProfile)
    .delete(isAuthenticatedUser, deleteAccount);

router.route("/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser)

router.route("/users/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser)



module.exports = router;