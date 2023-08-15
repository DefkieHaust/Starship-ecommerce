const express = require('express');
const app = express()
const cookieParser = require("cookie-parser")

const errorMiddleware = require('./middleware/error');

//for json;
app.use(express.json());
app.use(cookieParser())

//main route;
app.use('/api/v1', require('./routes/productRoute'));
app.use('/api/v1', require('./routes/userRoute'));
app.use('/api/v1', require('./routes/addressRoute'))
app.use('/api/v1', require('./routes/orderRoute'))

//use middlewares here;
app.use(errorMiddleware)


//export app;
module.exports = app;