const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/asyncError');
const ApiFeatures = require('../utils/apiFeatures');

// get all products
exports.getAllProducts = catchAsyncErrors( async(req, res, next)=> {
    // res.status(200).json({message: "route is working"})
    const resultPerPage = 5;
    const apiFeatures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);
    const products = await apiFeatures.query;
    const productCount = await Product.countDocuments(); 

    res.status(200).json({
        success: true,
        products,
        productCount

    });
})

// create product; --admin
exports.createProduct = catchAsyncErrors( async(req, res, next)=> {
    req.body.user = req.user.id;
    const postProduct = req.body;
    const product = await Product.create(postProduct)

    res.status(201).json({
        success: true,
        product
    })
})

// getProductDetails 
exports.getProductDetails = catchAsyncErrors( async(req, res, next)=> {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if(!product) {
        // res.status(500).json({
        //     success: false,
        //     message: 'product not found'
        // })
        return next(new ErrorHandler('product not found', 404));
    }

    res.status(200).json({
        success: true,
        product
    })
})


// updateProduct; --admin
exports.updateProduct = catchAsyncErrors( async(req, res, next)=> {
    const productId = req.params.id;
    const updateTheProduct = req.body;

    let product = await Product.findById(productId)

    if(!product) {
        return next(new ErrorHandler('product not found', 404));
    }

    product = await Product.findByIdAndUpdate(productId, updateTheProduct, {
        new: true,
        runValidator: true,
        useFindAndModify: false
    })

    res.status(201).json({
        success: true,
        product
    })
    
})

// deleteProduct -- admin;
exports.deleteProduct = catchAsyncErrors( async(req, res, next)=> {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    if(!product) {
        return next(new ErrorHandler('product not found', 404))
    }

    await product.deleteOne({_id :productId})

    res.status(200).json({
        success: true,
        product
    })
})