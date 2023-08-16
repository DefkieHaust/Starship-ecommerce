const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/asyncError');
const QueryHandler = require('../utils/queryHandler');
const Order = require('../models/orderModel');
const Address = require('../models/addressModel');
const Product = require('../models/productModel');

// Create New Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const {
        address,
        orderItems,
        paymentInfo
    } = req.body;

    const addressObj = await Address.findById(address);

    if(!addressObj) {
        return next(new ErrorHandler("Address not found", 400));
    }

    if(!orderItems.length) {
        return next(new ErrorHandler("No products found", 400));
    }
   
    const items = [];
    let total = 0

    for (const product of orderItems) {
        const item = await Product.findById(product.id);

        if(!item) {
            return next(new ErrorHandler("Product not found", 404));
        }

        total += item.price * product.quantity;
        let image

        try {
            image = item.images[0].url;
        } catch (err) {}

        items.push({
            product: item._id,
            name: item.name,
            price: item.price,
            quantity: product.quantity,
            image
        })
    }

    const shippingPrice = +process.env.SHIPPING_PRICE
    const totalPrice = shippingPrice + total;

    const order = await Order.create({
        user: req.user._id,
        name: req.user.name,
        address: addressObj._id,
        orderItems: items,
        paymentInfo,
        subtotal: total,
        shippingPrice,
        totalPrice,
    });

    if(!order) {
        return next(new ErrorHandler("Order not created", 500));
    }

    res.status(200).json({
        success: true,
        message: "Order created succesfully",
        order: order
    })
})


// Get all orders
exports.getOrders = catchAsyncErrors(async (req, res, next) => {
    const querySet = new QueryHandler(
        Order.find({ user: req.user._id }).populate("user", "name email"),
        req.query
    ).resolve();
    const orders = await querySet.query;

    res.status(200).json({
        success: true,
        orders
    })
})


// delete order
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if(order.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    await order.deleteOne();

    res.status(200).json({
        success: true,
        message: "Order deleted succesfully",
        order
    })

})


// get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    if(order.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    res.status(200).json({
        success: true,
        order
    })
})


// get all orders - admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const querySet = new QueryHandler(
        Order.find().populate("user", "name email"),
        req.query
    ).resolve();
    const orders = await querySet.query

    res.status(200).json({
        success: true,
        orders
    })

})


// update order - admin
exports.updateOneOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Order updated succesfully",
        order
    })
})


// getOneOrder - admin
exports.getOneOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        order
    })
})


// deleteOneOrder - admin
exports.deleteOneOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if(!order) {
        return next(new ErrorHandler("Order not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Order deleted succesfully",
        order
    })
    
})