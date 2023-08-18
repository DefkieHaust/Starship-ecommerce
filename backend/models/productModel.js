const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type:String,
        required: true,
        trim: true
    },
    description: {
        type:String,
        required: true
    },
    price: {
        type:Number,
        required: true,
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
        required: true
    },
    stock: {
       type: Number,
       required: true,
       maxLength: [4, "stock cannot exceed 5 characters"],
       default: 1

    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    vender:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

})


module.exports = mongoose.model("Product", productSchema)
