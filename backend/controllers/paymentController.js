const catchAsyncErrors = require("../middleware/asyncError");
const ErrorHandler = require("../utils/errorHandler");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const updateOrderStatus = require("../utils/updateOrderStatus");
const Order = require("../models/orderModel");

exports.paymentUpdateListener = catchAsyncErrors(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_KEY);
    } catch (err) {
        return next(new ErrorHandler(`Webhook Error: ${err.message}`, 400));
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.canceled':
            const paymentIntentCanceled = event.data.object;
            await Order.findByIdAndDelete(paymentIntentCanceled.metadata.order)
            break;
        case 'payment_intent.partially_funded':
            const paymentIntentPartiallyFunded = event.data.object;
            await updateOrderStatus(paymentIntentPartiallyFunded)
            break;
        case 'payment_intent.payment_failed':
            const paymentIntentPaymentFailed = event.data.object;
            await Order.findByIdAndDelete(paymentIntentPaymentFailed.metadata.order)
            break;
        case 'payment_intent.processing':
            const paymentIntentProcessing = event.data.object;
            await updateOrderStatus(paymentIntentProcessing)
            break;
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            await updateOrderStatus(paymentIntentSucceeded)
            await Order.findByIdAndUpdate(paymentIntentSucceeded.metadata.order, {
                paidAt: Date.now(),
            }, { useFindAndModify: false })
            break;
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});