const jwt = require('jsonwebtoken')

exports.jwToken = (user, expiredIn) => {
    return jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: expiredIn
    })
}