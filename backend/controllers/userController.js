const catchAsyncErrors = require("../middleware/asyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const QueryHandler = require("../utils/queryHandler");
const cloudinary = require("cloudinary").v2;

// register user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, confirmPassword} = req.body;

    if(password !== confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: process.env.DEFAULT_AVATAR_ID,
            url: process.env.DEFAULT_AVATAR_URL ,
        },
    });

    if(req.files && req.files.avatar) {
        const avatarUpload = await cloudinary.uploader.upload( req.files.avatar.tempFilePath, {
            folder: "avatars",
            width: 400,
            crop: "scale",
        })
        
        user.avatar = {
            public_id: avatarUpload.public_id,
            url: avatarUpload.secure_url,
        }

        await user.save()
    }

    sendToken(user, 201, res, "Account created successfully");
});

// login user;
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
 
    if (!email || !password) {
        return next(new ErrorHandler("Email or password missing", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
    }

    sendToken(user, 200, res, "Logged in successfully");
});

// logout functionalty
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});


// delete account
exports.deleteAccount = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    if(!req.body.password || !req.body.confirmPassword) {
        return next(new ErrorHandler("Password missing", 400));
    }

    const passwordMatched = await user.comparePassword(req.body.password);

    if (!passwordMatched) {
        return next(new ErrorHandler("Invalid password", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    const account = await User.findByIdAndDelete(req.user.id);

    const avatar = account.avatar.public_id

    if(avatar !== "avatars/default") {
        await cloudinary.uploader.destroy(avatar)
    }

    res.status(200).json({
        success: true,
        message: "Account deleted successfully",
        account,
    })
})

// forgotPassword;
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    let resetToken = user.getResetPasswordToken();
 

    await user.save({ validationBeforeSave: false });

    const passwordResetUrl = `${req.body.redirectURL}${resetToken}`;

    const message = `Below is your requested password url \n\n ${passwordResetUrl} \n \nIf you did not request the url, Please ignore this message`;

    try {
        sendEmail({
            email: user.email,
            subject: `Password reset request`,
            message,
        });

        res.status(200).json({
            success: true,
            message: `Reset password email sent to ${user.email} successfully!`,
        });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validationBeforeSave: false });

        return next(new ErrorHandler(err.message, 400));
    }
});


// resetpassword;
exports.resetPassword = catchAsyncErrors(async(req, res, next)=> {
    const token = req.params.token;
    
    
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire:{$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset password token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password are not matching!", 400))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 201, res, "Password reset successfully")

})


// get user profile
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });
});

// update password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const passwordMatched = await user.comparePassword(req.body.password);

    if (!passwordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res, "Password updated successfully");
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const avatar = req.files.avatar;

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if(avatar) {
        const avatarUpload = await cloudinary.uploader.upload(avatar.tempFilePath, {
            folder: "avatars",
            width: 400,
            crop: "scale",
        })

        if(req.user.avatar.public_id !== "avatars/default") {
            await cloudinary.uploader.destroy(req.user.avatar.public_id)
        }

        newUserData.avatar = {
            public_id: avatarUpload.public_id,
            url: avatarUpload.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
    });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
        );
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const querySet = new QueryHandler(User.find(), req.query).resolve();
    const users = await querySet.query;
    const userCount = await User.countDocuments();

    res.status(200).json({
        success: true,
        users,
        userCount
    });
});

// update User Profile (admin)
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
    });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        return next(
            new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
        );
    }

    await user.deleteOne()

    const avatar = user.avatar.public_id

    if(avatar !== "avatars/default") {
        await cloudinary.uploader.destroy(avatar)
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        user
    });
});