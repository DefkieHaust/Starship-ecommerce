const express = require('express');
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const morgan = require('morgan')
const dotenv = require('dotenv')

const errorMiddleware = require('./middleware/error');
const ErrorHandler = require('./utils/errorHandler');

dotenv.config({path: './config/.env'})

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
})

// loggers
app.use(morgan("combined"))

//webhooks events
app.use('/api/v1', require('./routes/webhookRoute'))

//request middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));

//main route;
app.use('/api/v1', require('./routes/productRoute'));
app.use('/api/v1', require('./routes/userRoute'));
app.use('/api/v1', require('./routes/addressRoute'))
app.use('/api/v1', require('./routes/orderRoute'))


//response middlewares
app.use(errorMiddleware)


//export app;
module.exports = app;
