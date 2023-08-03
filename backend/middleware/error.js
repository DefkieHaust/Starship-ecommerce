// import errorHandler from "../utils/errorHandler";
const ErrorHandler = require('../utils/errorHandler');

module.exports =(err ,req, res, next)=> {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  if(err.name === "CastError") {
    message = `Resource not found, Error ${err.path}`;
    err = new ErrorHandler(message, 404)

  }
  // mongoose duplicate key error;
  if(err.code === 1100) {
    const message = `Duplicate ${Object.keys(err.keyValue)} enterd`
    err = new ErrorHandler(message, 400)
}

// wrong jwt error;
if(err.name === 'jsonWebTokenError') {
    const message = `json web token is invalid, Try again`;
    err = new ErrorHandler(message, 400)
}

// expired token error
if(err.name === 'TokenExpiredError') {
    const message = `json web token is expired, Try again`;
    err = new ErrorHandler(message, 400)
}

  res.status(res.statusCode).json({
    succuess: false,
    //err: err.stack,
    message: err.message
  });


}