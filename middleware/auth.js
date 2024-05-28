const jwt = require("jsonwebtoken")

exports.authUser = async (req, res, next) => {
    try {
        let temporary = req.header('Authorization')
        let token = temporary ? temporary.slice(7, temporary.length) : ""

        if (!token) {
            return res.status(404).json({
                message: "User have not valid token"
            })
        }
        jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
            if (err) {
                return res.status(404).json({
                    message: "Invalid Authorization"
                })
            }
            req.user = user
            next()
        })
    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}