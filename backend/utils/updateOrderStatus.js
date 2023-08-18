const Order = require('../models/orderModel');

module.exports = async (payment) => {
    await Order.findByIdAndUpdate( payment.metadata.order, {
        paymentInfo: {
            status: payment.status,
            id: payment.id
        }
    }, { useFindAndModify: false })
}