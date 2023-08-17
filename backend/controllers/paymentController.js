const catchAsyncErrors = require("../middleware/asyncError");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.sendPaymentsApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ PaymentsApiKey: process.env.STRIPE_API_KEY });
});

exports.paymentUpdateListener = catchAsyncErrors(async (req, res, next) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_KEY);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.canceled':
            const paymentIntentCanceled = event.data.object;
            // Then define and call a function to handle the event payment_intent.canceled
            break;
        case 'payment_intent.partially_funded':
            const paymentIntentPartiallyFunded = event.data.object;
            // Then define and call a function to handle the event payment_intent.partially_funded
            break;
        case 'payment_intent.payment_failed':
            const paymentIntentPaymentFailed = event.data.object;
            // Then define and call a function to handle the event payment_intent.payment_failed
            break;
        case 'payment_intent.processing':
            const paymentIntentProcessing = event.data.object;
            // Then define and call a function to handle the event payment_intent.processing
            break;
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.send();
});