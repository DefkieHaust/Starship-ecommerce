const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: mongoose.Schema.ObjectId,
        ref: "Address",
        required: [true, "Please provide address"],
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true,
            },
        },
    ],
    paymentInfo: {
        id: {
            type: String,
            required: [true, "Please provide payment id"]
        },
        status: {
            type: String,
            required: [true, "Please provide payment status"]
        },
    },
    paidAt: {
        type: Date,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    orderStatus: {
        type: String,
        required: true,
        default: "Processing",
    },
    deliveredAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// make sure that product is always unique in the array
orderSchema.path('orderItems').validate((list) => {
    const products = list.map(obj => obj.product.toString());
    return products.length === new Set(products).size;
}, 'Duplicate products found in the array');

module.exports = mongoose.model("Order", orderSchema);