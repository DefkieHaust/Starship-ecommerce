const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require("../controllers/userController");
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();

router.route("/user/register")
    .post(registerUser);

router.route("/user/login")
    .post(loginUser)

router.route("/user/password/reset")
    .post(forgotPassword);

router.route('/user/password/reset/:token')
    .put(resetPassword);

router.route("/user/logout")
    .get(isAuthenticatedUser, logoutUser);


module.exports = router;