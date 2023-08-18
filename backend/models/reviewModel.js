const mongoose = require('mongoose');

const reviewScheme = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        max: 5,
        min: 1,
        required: true
    },
    comment: {
        type: String,
    }
})

module.exports = mongoose.model('Review', reviewScheme);