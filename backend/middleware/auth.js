const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./asyncError");
const jwt = require('jsonwebtoken')


exports.isAuthenticatedUser = catchAsyncError(async (req, res, next)=> {
     //use cookie parser in app.js
    const {token} = req.cookies;
    // console.log("tok",token)

    if(!token) {
        return next(new ErrorHandler("please login to access this resource", 401))
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET)
    // console.log("dec",decodeData)

    req.user = await User.findById(decodeData.id)
    next();
})

exports.authorizeRoles = (...roles) => {
    
    return (req, res, next)=> {
        console.log("pati",req.user);
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} is not allow to access this route`, 403))
        }
        next();
    }
    
}