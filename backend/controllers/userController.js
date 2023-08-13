const catchAsyncError = require("../middleware/asyncError");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

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
    message: "Logged out successfully",
  });
});

// forgotPassword;
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
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
exports.resetPassword = catchAsyncError(async(req, res, next)=> {
    const token = req.params.token;
    
    
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire:{$gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("reset password token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password and confirm password are not matching!"))
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 201, res)

})