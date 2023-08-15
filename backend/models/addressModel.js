const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: [true, 'Please provide address'],
    },
    city: {
        type: String,
        required: [true, 'Please provide city'],
    },
    state: {
        type: String,
        required: [true, 'Please provide state'],
    },
    country: {
        type: String,
        required: [true, 'Please provide country'],
    },
    zipCode: {
        type: Number,
        required: [true, 'Please provide zipCode'],
    },
})

module.exports = mongoose.model('Address', addressSchema);