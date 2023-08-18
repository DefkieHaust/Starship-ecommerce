const ErrorHandler = require("../utils/errorHandler")

module.exports = (...fields) => {
    return (req, res, next) => {
        const errors = []
        fields.forEach(field => {
            if(!req.body[field]){
                errors.push(field)
            }
        })
        if(errors.length){
            return next(new ErrorHandler(`${errors.join(', ')} field required`, 400))
        }
        next()
    }
 
}