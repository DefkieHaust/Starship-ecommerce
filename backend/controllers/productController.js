const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/asyncError');
const QueryHandler = require('../utils/queryHandler');
const Review = require('../models/reviewModel');

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
        message: "Product created successfully",
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
        runValidators: true,
        useFindAndModify: false
    })

    res.status(201).json({
        success: true,
        message: "Product updated successfully",
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

    await product.deleteOne()

    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        product
    })
})

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
  
    const review = {
        product: product._id,
        user: req.user._id,
        name: req.user.name,
        rating: rating,
        comment,
    };

    const oldReview = await Review.findOne({product: product._id, user: req.user._id});

    if (oldReview) {
        oldReview.rating = rating
        oldReview.comment = comment;
        await oldReview.save({ useFindAndModify: false });
    } else {
        await Review.create(review);
        product.numOfReviews += 1;
    }

    const prodReviews = await Review.find({ product: product._id });
    let avg = 0;

    prodReviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.rating = avg / prodReviews.length;

    await product.save({ runValidators: false, useFindAndModify: false });

    res.status(200).json({
        success: true,
        message: `Review ${oldReview ? "updated" : "created"} successfully`,
        reviews: prodReviews,
        numOfReviews: product.numOfReviews
    });
});

// Get All Reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const query = new QueryHandler(Review.find({ product: product._id }), req.query);
  const querySet = query.resolve()
  const reviews = await querySet.query;

  res.status(200).json({
    success: true,
    reviews,
    numOfReviews: product.numOfReviews
  });
});

// Delete Review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const review = await Review.findOne({ user: req.user._id, product: product._id });
  
  if (review) {
    await review.deleteOne();
  } else {
    return next(new ErrorHandler("Review not found", 404));
  }

  const reviews = await Review.find({ product: product._id });
  
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  if (reviews.length === 0) {
    product.rating = 0;
  } else {
    product.rating = avg / reviews.length;
  }

  product.numOfReviews = reviews.length;

  await product.save({ useFindAndModify: false });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    reviews,
    numOfReviews: product.numOfReviews
  });
});