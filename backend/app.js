const express = require('express');
const app = express()
const cookieParser = require("cookie-parser")

const errorMiddleware = require('./middleware/error');

//for json;
app.use(express.json());
app.use(cookieParser())

//main route;
const product = require('./routes/productRoute');
const userRoute = require('./routes/userRoute')
app.use('/api/v1', product);
app.use('/api/v1', userRoute);


//use middlewares here;
app.use(errorMiddleware)


//export app;
module.exports = app;