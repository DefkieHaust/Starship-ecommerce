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
const requireFields = require('../middleware/requireFields');
const router = express.Router();

router.route("/user/register")
    .post(
        requireFields(
            "name",
            "email",
            "password",
            "confirmPassword"
        ),
        registerUser
    );

router.route("/user/login")
    .post(
        requireFields(
            "email",
            "password"
        ),
        loginUser
    )

router.route("/user/password/update")
    .put(
        isAuthenticatedUser,
        requireFields(
            "password",
            "newPassword",
            "confirmNewPassword"
        ),
        updatePassword
    )

router.route("/user/password/reset")
    .put(
        requireFields("email"),
        forgotPassword
    );

router.route('/user/password/reset/:token')
    .put(
        requireFields("password", "confirmPassword"),
        resetPassword
    );

router.route("/user/logout")
    .get(isAuthenticatedUser, logoutUser);

router.route("/user")
    .get(isAuthenticatedUser, getUserDetails)
    .put(isAuthenticatedUser, updateProfile)
    .delete(
        isAuthenticatedUser,
        requireFields("password", "confirmPassword"),
        deleteAccount
    );

router.route("/users")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser)

router.route("/users/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser)



module.exports = router;