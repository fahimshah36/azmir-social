const Users = require('../models/userModel')
const { validateEmail, validateLength, validateUsername } = require('../helpers/validation')
const bcrypt = require('bcrypt');
const { jwToken } = require('../helpers/token');
const jwt = require('jsonwebtoken')
const { sendVerifiedEmail } = require('../helpers/mailer');

exports.newUser = async (req, res) => {
    try {
        const {
            fName,
            lName,
            email,
            username,
            password,
            bMonth,
            bDay,
            bYear,
            gender,
            verified
        } = req.body

        if (!validateEmail(email)) {
            return res.status(400).json({
                message: "Invalid Email Address"
            })
        }

        const checkMail = await Users.findOne({ email })

        if (checkMail) {
            return res.status(400).json({
                message: "Email already Exists"
            })
        }

        if (!validateLength(fName, 3, 15)) {
            return res.status(400).json({
                message: "FirstName Should be minimum 3 and max 15 characters"
            })
        }

        if (!validateLength(lName, 3, 15)) {
            return res.status(400).json({
                message: "LastName Should be minimum 3 and max 15 characters"
            })
        }

        if (!validateLength(password, 8, 40)) {
            return res.status(400).json({
                message: "Password should be minimum 8 characters"
            })
        }

        // bcrypt-password
        const crypted = await bcrypt.hash(password, 10)

        // validate Username
        let tempUsername = fName + lName
        let finalUsername = await validateUsername(tempUsername)

        const user = await new Users({
            fName,
            lName,
            email,
            username: finalUsername,
            password: crypted,
            bMonth,
            bDay,
            bYear,
            gender,
            verified
        }).save()

        const emailToken = jwToken({ id: user._id.toString() }, "30m")
        const url = `${process.env.BASE_URL}/activate/${emailToken}`

        sendVerifiedEmail(user.email, user.fName, url)

        const token = jwToken({ id: user._id.toString() }, "7d")

        res.send({
            id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            token: token,
            verified: user.verified,
            message: "Registration success! PLease activate your email to start"
        })

    } catch (error) {
        res.status(404).json({
            message: "Can not create user"
        })
    }
}


exports.verifiedUser = async (req, res) => {
    try {
        const verified = req.user.id
        const { token } = req.body
        const user = jwt.verify(token, process.env.SECRET_TOKEN)
        const check = await Users.findById(user.id)

        if (verified !== user.id) {
            return res.status(400).json({
                message: "You don't have authorization to complete this operation"
            })
        }

        if (check.verified === true) {
            return res.status(400).json({
                message: "This email is already verified"
            })
        } else {
            await Users.findByIdAndUpdate(user.id, { verified: true })
            return res.status(200).json({
                message: "Account has been activated successfully"
            })
        }
    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await Users.findOne({ email })
        if (!user) {
            return res.status(400).json({
                message: "The email address you entered is not connected to an account"
            })
        }
        const check = await bcrypt.compare(password, user.password)
        if (!check) {
            return res.status(400).json({
                message: "Invalid credentials. Please try again"
            })
        }
        const token = jwToken({ id: user._id.toString() }, "7d")
        res.send({
            id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            token: token,
            verified: user.verified,
            message: "Login success"
        })
    } catch (error) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.reVerification = async (req, res) => {
    try {
        let id = req.user.id;
        const user = await Users.findById(id)
        if (user.verified === true) {
            return res.status(400).json({
                message: "This account is already activated"
            })
        }
        const emailToken = jwToken({ id: user._id.toString() }, "30m")
        const url = `${process.env.BASE_URL}/activate/${emailToken}`

        sendVerifiedEmail(user.email, user.fName, url)
        return res.status(200).json({
            message: "Email verification link has been sent to your account"
        })

    } catch (error) {
        res.status(404).json({
            message: err.message
        })
    }
}
