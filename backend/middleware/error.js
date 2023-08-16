const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal server error";


    if (err.name === "CastError") {
        message = `${err.model.modelName} not found, Error ${err.path}`;
        err = new ErrorHandler(message, 404);
    }
    // mongoose duplicate key error;
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} enterd`;
        err = new ErrorHandler(message, 400);
    }

    // wrong jwt error;
    if (err.name === "JsonWebTokenError") {
        const message = `json web token is invalid, Try again`;
        err = new ErrorHandler(message, 400);
    }

    // expired token error
    if (err.name === "TokenExpiredError") {
        const message = `json web token is expired, Try again`;
        err = new ErrorHandler(message, 400);
    }
  
    res.status(err.statusCode).json({
        success: false,
        message: process.env.DEBUG ? err.stack : err.message,
    });
};
