const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middleware/asyncError');
const QueryHandler = require('../utils/queryHandler');
const Address = require('../models/addressModel');

// create address
exports.createAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.create({
        user: req.user._id,
        ...req.body
    });

    res.status(201).json({
        success: true,
        message: 'Address created successfully',
        address
    })
})

// get address
exports.getAddresses = catchAsyncErrors(async (req, res, next) => {
    const addresses = await Address.find({ user: req.user._id });

    res.status(200).json({
        success: true,
        addresses,
    })
})

// update address
exports.updateAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findByIdAndUpdate(req.params.id, {
        user: req.user._id,
        ...req.body
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address
    })

})

// delete address
exports.deleteAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findById(req.params.id);

    if (!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    if(address.user.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Unauthorized", 401));
    }

    await address.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        address
    })
})

// get single address
exports.getSingleAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findById(req.params.id);

    if (!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    res.status(200).json({
        success: true,
        address
    })
})

// get all addresses admin
exports.getAllAddresses = catchAsyncErrors(async (req, res, next) => {
    const querySet = new QueryHandler(Address.find(), req.query).resolve();
    const addresses = await querySet.query;
    const count = await Address.countDocuments();

    res.status(200).json({
        success: true,
        addresses,
        numOfAddresses: count
    })

})


// delete address admin
exports.deleteOneAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findByIdAndDelete(req.params.id);

    if (!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        address
    })

})

// update address admin
exports.updateOneAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findByIdAndUpdate(req.params.id, {
        ...req.body
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    if (!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address
    })

})


// get single address admin
exports.getOneAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await Address.findById(req.params.id);

    if(!address) {
        return next(new ErrorHandler('Address not found', 404));
    }

    res.status(200).json({
        success: true,
        success: true,
        address
    })
})