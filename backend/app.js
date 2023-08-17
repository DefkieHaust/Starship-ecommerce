const express = require('express');
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const errorMiddleware = require('./middleware/error');

//for json;
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));

//main route;
app.use('/api/v1', require('./routes/productRoute'));
app.use('/api/v1', require('./routes/userRoute'));
app.use('/api/v1', require('./routes/addressRoute'))
app.use('/api/v1', require('./routes/orderRoute'))

//use middlewares here;
app.use(errorMiddleware)


//export app;
module.exports = app;