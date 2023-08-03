1=======================;
install mongoose, dotenc, express

2=======================;
create server;
const app = require('./app');
const dotenv = require('dotenv')

//config;
dotenv.config({path: 'backend/config/config.env'})
app.listen(process.env.PORT, ()=> {
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})


3===========================;
create first route products;
//////////////app.js
const express = require('express');
const app = express();

//for express json
app.use(express.json())

//import routes
const product = require('./routes/productRoute');

app.use("/api/v1", product);


module.exports = app;

///////productController.js
exports.getAllProducts = (req, res)=> {
    res.status(200).json({message:'route is working'})
}


/////////////productRoute.js
const express = require("express");
const { getAllProducts } = require("../controllers/productController");

const router = express.Router();


router.route("/products").get(getAllProducts);

module.exports = router;



4=====================================;
now connect database;
create a folder in config folder as database.js;
const mongoose = require("mongoose");


const connectDatabase =()=> {
    mongoose
      .connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      })
      .then((data) => {
        console.log(`mongodb is connected with server ${data.connection.host}`);
      }).catch((err)=> {
        console.log(err)
      })
}

module.exports = connectDatabase;

then, 
import it in server.js
const connectDatabase = require('./config/database')
//connect databse;
connectDatabase()


5========================================;
for database conection first you have to create a database in mongodb website;
check uri also;



6========================================;
now create schema,
create models folder and productModel.js init;
const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name: {
        type:String,
        required: [true, "please enter your product Name"],
        trim: true
    },
    description: {
        type:String,
        required: [true, "please enter your product description"]
    },
    price: {
        type:Number,
        required: [true, "please enter your product price"],
        maxLength: [8, "price cannot exceed 8 characters"]
    },
    rating : {
       type: Number,
       default: 0
    },
    images: [{
        public_id:{
            type: String,
            required: true
        
        },
        url: {
            type: String,
            required: true
        }

    }],
    category: {
        type: String,
        required: [true, "please enter product category"],

    },
    Stcok: {
       type: Number,
       required: [true, "please enter your stock"],
       maxLength: [4, "stock cannot exceed 5 characters"],
       default: 1

    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }


})


module.exports = mongoose.model("Product", productSchema);




7==================================================;
import Product schema in productController.js
make all roducts create, read, delete and update functionalty;
const Product = require("../models/productModel");

//createProduct; --admin
exports.createProduct = async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
};

// get all product;
exports.getAllProducts = async (req, res) => {
  // res.status(200).json({message:'route is working'})
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
};

//getProduct Details;
exports.getproductDetails = async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: "product not found",
    });
  }


  return res.status(200).json({
    success: true,
    product,
  });


};

//update product --admin;
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(500).json({
      success: false,
      message: "product not found",
    });
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidator: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    product,
  });
};

//delete product - admin;
exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "product not found",
      });
    }

    await product.deleteOne({ _id: productId }); //{_id: productId}

    return res.status(200).json({
      success: true,
      message: "product deleted sucessfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};


8=======================================================;
set routes in productRoute.js routes folder;
router.route("/products").get(getAllProducts);
router.route("/product/new").post(createProduct);
router.route("/product/:id").put(updateProduct).delete(deleteProduct).get(getproductDetails);  //endpoint are same 


9========================================================;
product routes and controllers are complete now;


10=======================================================;
make a folder of utils and errorHandler init;
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}
module.exports = ErrorHandler;

then,
create middlewares folder and error.js init;
this will show the error and message;

const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500;
    err.message= err.message || "internal server error";

    res.status(res.statusCode).json({
        success: false,
        // error: err.stack
        message: err.message
    });
};


then, 
import the middleware in app.js and use it;
//middleware for errror;
app.use(errorMiddleware);


then, 
change the 
if(!product) {
res.status(500).json({
  etc
})
}
into
if (!product) {
return next(new ErrorHandler("product not found", 404)); //error handling using extend the Error es6
}




11===============================;
now make middleware for try catch;
for async error;
make a file asyncError in middleware folder;
module.exports = (theFunc) => (req, res, next)=> {
    Promise.resolve(theFunc(req, res, next)).catch(next)
}
then,
wrap the functions in productController init;
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});



12==============================================
if unhandled error occured so close the server;
eg. mongodb link error;
//unhandled Promise Rejection error //server error
process.on("unhandledRejection", (err)=> {
   console.log(`Error: ${err.message}`);
   console.log(`shutting down the server due to unhandled Promise Rejection`)

   server.close(()=> {
    process.exit(1)
   });
});

then,
comment the catch part of code in database.js;
then,
for uncaught Exception error;
eg: if we write a code like console.log(youtube) in server.js or app.js
it will give us undefine;
process.on("uncaughtException", (err)=> {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to Uncaught exception`);
    // for shutting down th server
    process.exit(1);
})

we have to write the above code above all the content;

then, 
if we have mongodb id error like we insert id after product and the id wrong;
so we can get these type of error also in mannered way;
 // wrong mongodb id error // cast error // catch the path of error;
    if(err.name === "CastError") {
        const message = `Resource not found, Invalid : ${err.path}`;
        err = new ErrorHandler(message, 400);
}

then, 
check the getDetailsProduct and give id wrong and check what happening now;


13=============================================;
the error handling part is completed now go for,
queries,
search, filter, pagination;

query in the url means anything after the ? mark;
like,
`http://localhost:4000/products?keyword=tshirt`  //here 'keyword=tshirt' is query

now, 
make a file named apiFeatures in utils folder;
and code;
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    console.log(keyword);

    this.query = this.query.find({ ...keyword });
    return this;
  }
}

module.exports = ApiFeatures;

then, 
come to product controller.js and import apiFeatures class;
and below code in getAllProducts fuction;
const apiFeature = new ApiFeatures(Product.find(), req.query).search()  //req.query.keyword
  // const products = await Product.find();
const products = await apiFeature.query;   //after making the apiFeatures class


then,
goto postman and check the search is working or not?

http://localhost:4000/api/v1/products?keyword=product2

search is complete now we have to add filter functionalty;


14==========================;
adding filter functionalty;

// filtering;
   filter() {
    const queryCopy = {...this.queryStr};
    console.log(queryCopy)

    // removing some fields or keywords for category;
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key)=> delete queryCopy[key]);
    console.log(removeFields);
    
   }

   then, 
   call filter in getAllProducts()
     const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter();


complete filter code;

 filter() {
    const queryCopy = {...this.queryStr};
    // console.log(queryCopy)

    // removing some fields or keywords for category;
    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key)=> delete queryCopy[key]);
    console.log(queryCopy);

    // filter for price and rating;
    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=> `$${key}`);

    console.log(queryStr)

    // this.query = this.query.find(queryCopy);
    this.query = this.query.find(JSON.parse(queryStr)); 
    console.log(queryStr)
    return this;
   }

filter is complete now its time to paginate our api;


15================================================;
pagination;

goto getAllProducts() function and add resultPerPage variable;
 pagination(resultPerPage) {

    const currentPage = Number(this.queryStr.page) || 1;   //50 - 5

    //if we are on first page (1 -1) * resultPerPage = 0, so we will skip 0;
    const skip = resultPerPage * (currentPage - 1) 

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
   }


then, 
call it in getAllProducts() function;



16================================================;
now work on user & password
authentication;

install packages;
npm i bcryptjs jsonwebtoken validator nodemailer cookie-parser body-parser

17===========================================;
make a userModel.js in model folder and create a schema init;
const mongoose = require('mongoose');
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
        maxLength: [30, "name can't exceed 30 characters"],
        minLength: [4, "name should have more than 4 character"],
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email'],
    },
    password: {
        type: String,
        required: [true, 'please enter your password'],
        minLength: [8, "password should have 8 characters"],
        select: false

    },
    avatar: {
        public_id:{
            type: String,
            required: true
        
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: 'user',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

module.epxorts = mongoose.model('User', userSchema);


18=============================================;
make userController.js in controller folder;
const User = require('../models/userModel')
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/asyncErrors");

//register user;
exports.registerUser = catchAsyncErrors( async(req, res, next)=> {
    const {name, email, password} = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is avatar",
            url : "profile picture"
        }
    })

    res.status(201).json({
        success: true,
        user,
    });
})

then,

make a userRoute,
const express = require('express');
const {registerUser} = require('../controllers/userController')
const router = express.Router()

router.route('/register').post(registerUser);

module.exports = router;

then,
import router in app.js
const user = require('./routes/userRoute');
app.use("/api/v1", user);

then,
check in postman;


19==============================================================;
for password hashing;
make a function in userModel under userSchema;

userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

then,
check in post man the password is bcrypted or not;


20======================================================================;
now use jwt;
got0 userModel.js and;
// jwt token
userSchema.methods.getJWTToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

then,
open userController file and send token in registerUser function
 const token = user.getJWTToken()

    res.status(201).json({
        success: true,
        // user,
        token
    });

then, 
check in post man, if the registration give us token or not,


21======================================================;
login functionalty;

goto userController;

// login
exports.loginUser = catchAsyncErrors(async(req, res, next)=> {

    const {email, password} = req.body;

    //checking if user has given password and email both;

    if(!email || !password) {
        return next(new ErrorHandler('Invalid email and password', 400));
    }

    const user = await User.findOne({email}).select("+password");

    if(!user) {
        return next(new ErrorHandler('invalid email or password', 401))
    }

    const isPasswordMatch = user.comparePassword(password);

    if(!isPasswordMatch) {
        return next(new ErrorHandler('invalid email or password', 401))
    }

   const token = user.getJWTToken();

    res.status(200).json({
        success: true,
        token,
    })

});

then,
userModel.js;
// compare password;
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}
then, 
userRoute.js;
router.route('/login').post(loginUser);

then, 
postman checking,give email and password and check token is getting or not,


22=============================================;
add some reusable code;
make new file in utils folder naming jwtToken.js;
//create token and save in cookie;
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  //option for cookies;
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 50 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};

module.exports = sendToken;

then,
import it and use it;
// const token = user.getJWTToken()
    // res.status(201).json({
    //     success: true,
    //     // user,
    //     token
    // }); 

    //we will user the below code instead of the above code;
    sendToken(user, 201, res);  //in register user;   
    sendToken(user, 200, res);  //in login user;

then,
check in post man send email and password for login and check the cookies;



23=============================================;
Add a condition to check the products only if the user is logged in; otherwise, do nothing.

create a file auth.js in middlewares;
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./asyncErrors');
const jwt = require('jsonwebtoken')

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next)=> {
  //install cookie-parser and use it in app.js
    // const token = req.cookies;  
    const {token} = req.cookies;
    console.log(token)
    if(!token) {
        return next(new ErrorHandler("please login to access this resourse", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedData.id)
    next()

});

then, 
import in productRoute and add before product route;
router.route("/products").get(isAuthenticatedUser, getAllProducts);
then,
check in postman products are getting or not?



24=================================================================;
now code logout functionalty;
goto userControler in controllers folder;
// logout user
exports.logout = catchAsyncErrors(async(req, res, next)=> {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    // res.clearCookie('token', {
    //     expires: new Date(Date.now()),
    //     httpOnly: true,
    //   });

    res.status(200).json({
        success: true,
        message: "Looged Out"
    })
})

then,
import function in userRoutes;
router.route('/logout').get(logout);
then,
check in postman api;


25======================================================;
now make a authorizeRole() functionalty which will check the user is admin or user;
const { isAuthenticatedUser, authorizeRole } = require("../middlewares/auth");
router.route("/products").get(isAuthenticatedUser, authorizeRole('admin'), getAllProducts);

// check and authorize roles
exports.authorizeRoles =(...roles)=> {
   return (req, res, next)=> {
    if(!roles.includes(req.user.role)) {
       return next(new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`, 403)) 
    }

    next();
   };
};

then,
make login to api and make admin any user from database;
then,
add authorizeRoles function in createProduct, updateProduct and deleteProduct;
remove from getAllProducts;


26=============================================================;
add one more functionalty;
identify who created the product;
goto productModel and add the below code in schema before created date;

 user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
},

then,
goto createProduct() function and add one line of code;
req.body.user = req.user.id;
then,
check the api, create new product and check the product has user id?

27============================================================================;
reset password functionalty;
install crypto dependency;
https://www.tutorialspoint.com/execute_nodejs_online.php
check the below code in the online editor;
const crypto = require('crypto');

const token = crypto.randomBytes(20).toString('hex');
console.log(token)

const tokenCrypto = crypto.createHash("sha256").update(token).digest('hex');

console.log(tokenCrypto)
https://www.tutorialspoint.com/execute_nodejs_online.php

then,
userSchema.methods.getResestPasswordToken = function () {
  // generating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // expires in
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 minutes generated;

  return resetToken;
};


28=================================================;
forgot password route;
goto userController and create forgotPassword route and import it in userRoute;
// forgot password;
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  //getResetPassword token;
  const resetToken = user.getResestPasswordToken();

  await user.save({ validateBeforeSave: false });

  // link which we send to the user who forgot password;
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  //message which we will send to user;
  const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore this message`;

  try {
    await sendEmail({
       email: user.email,
       subject: `Ecommerce password recovery`,
       message,
    });

    res.status(200).json({
        success: true,
        message: `email send to ${user.email} successfully`
    });

  }catch(error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500))
    
  }
});

then,
const nodemailer = require('nodemailer')

const sendEmail = async (options)=> {
    const transporter = nodemailer.createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        service: process.env.SMPT_SERVICE,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions)
};
module.exports = sendEmail;

then,
set all variables in .env file;
and create a appCode from app password google.accounts security;

then,
check the api;

29=========================================================;
now make resetPassword route;
goto userController.js and make resetPassword() function;
// Reset password;
exports.resetPassword = catchAsyncErrors(async(req, res, next)=> {
    //  creating token hash;
    // console.log('Token:', req.params.token);
    const resetPasswordToken = req.params.token //crypto.createHash("sha256").update(req.params.token).digest("hex");
    // console.log('Token (after hash):', resetPasswordToken);
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()},

    });
    // console.log("user1", user)
    if(!user) {
        return next(new ErrorHandler("reset password token is invalid or has been expired", 400))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("passwords does not match", 400))
    }
    

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);

});

then, 
import it in userRoute;


30=========================================================;
error handling;
duplicate user error;
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


31=================================================================;
backend user routes api's;


































