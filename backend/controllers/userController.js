const catchAsyncError = require("../middleware/asyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")

// register user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is avatar",
      url: "this is avatar url",
    },
  });

  sendToken(user, 201, res);
});

// login user;
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("invalid email or password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  const isPasswordMatch = user.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorHandler("wrong password entered", 400));
  }

  sendToken(user, 200, res);
});

// logout functionalty
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out successfully",
  });
});

// forgotPassword;
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  let resetToken = user.getResetPasswordToken();
 
//   console.log("resetToken1", resetToken);

  await user.save({ validationBeforeSave: false });

  const passwordResetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/password/reset/${resetToken}`;

  const message = `Below is your requested password url \n\n ${passwordResetUrl} \n \nIf you are not requested the url, Please ignore this message`;

  try {
    sendEmail({
      email: user.email,
      subject: `Password reset request`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Reset password email send to ${user.email} successfully!`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validationBeforeSave: false });

    return next(new ErrorHandler(err.message, 400));
  }
});


// resetpassword;
exports.resetPassword = catchAsyncError(async(req, res, next)=> {
    const token = req.params.token;
    console.log("req.params.token;", token)
    
    
    
    const user = await User.findOne({
        resetPasswordToken: token,
        // resetPasswordExpire:{$gt: Date.now()}
        // resetPasswordExpire: {$gt: Date.now()},
    })

    if(!user){
        return next(new ErrorHandler("reset password token is invalid or has been expired", 400))
    }

    console.log("user", user)
    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password are not matching!"))
    }

    let oldPass = user.password;
    oldPass = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 201, res)

})