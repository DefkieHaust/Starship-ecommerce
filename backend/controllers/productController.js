const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/asyncError');
const QueryHandler = require('../utils/queryHandler');

// get all products
exports.getAllProducts = catchAsyncErrors( async(req, res, next)=> {
    const querySet = new QueryHandler(Product.find(), req.query).resolve();
    const products = await querySet.query;
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

    await product.deleteOne({_id: productId})

    res.status(200).json({
        success: true,
        product
    })
})