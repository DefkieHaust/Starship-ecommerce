const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword } = require("../controllers/userController");
const router = express.Router();

router.route("/user/register").post(registerUser);
router.route("/user/login").post(loginUser)
router.route("/user/forgot/password").post(forgotPassword);
router.route('/user/password/reset/:token').post(resetPassword);
router.route("/user/logout").get(logoutUser);


module.exports = router;