const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
        maxLength: [20, "name does not exceed 20 characters"],
        minLength: [4, "name must have more than four characters"]
    },
    email: {
        type:String,
        required: [true, "please enter your name"],
        unique: true,
        validate: [validator.isEmail, "please enter correct email"],
    },
    password: {
        type: String,
        maxLength: [20, "password does not exceed to 20 characters"],
        minLength: [6, "password must be six or more than six characters"],
        select: false
    },
    avatar: {
        public_id:{
            type: String,
            required: true
        
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type:String,
        default: "user"
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date
    }
})

// for password hashing
userSchema.pre("save", async function(next) {
 
    if(!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// jwtToken;
userSchema.methods.getJWTToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}
// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
//   };

// for reset password;
userSchema.methods.getResetPasswordToken = function() {
    // generating token;
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordToken = resetToken;
    //  = resPassTok;
    this.resetPasswordExpire = new Date(Date.now()) + 15 * 60 * 1000;
    // console.log("resetToken",resetToken);
    // console.log("this.resetPasswordToken", this.resetPasswordToken)

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);