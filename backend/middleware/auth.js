const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./asyncError");
const jwt = require('jsonwebtoken')


exports.isAuthenticatedUser = catchAsyncError(async (req, res, next)=> {
     //use cookie parser in app.js
    const {token} = req.cookies;

    if(!token) {
        return next(new ErrorHandler("Please login to access this resource", 401))
    }

    const decodeData = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decodeData.id)
    next();
})

exports.authorizeRoles = (...roles) => {
    
    return (req, res, next)=> {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Access denied`, 403))
        }
        next();
    }
    
}