const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type:String,
        required: [true, "please enter your product Name"],
        trim: true
    },
    description: {
        type:String,
        required: [true, "please enter your product description"]
    },
    price: {
        type:Number,
        required: [true, "please enter your product price"],
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
        required: [true, "please enter product category"],

    },
    Stcok: {
       type: Number,
       required: [true, "please enter your stock"],
       maxLength: [4, "stock cannot exceed 5 characters"],
       default: 1

    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }


})


module.exports = mongoose.model("Product", productSchema)
