const Users = require('../models/userModel')
const { validateEmail, validateLength, validateUsername } = require('../helpers/validation')
const bcrypt = require('bcrypt');
const { jwToken } = require('../helpers/token');

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
        console.log(emailToken);

        res.send(user)

    } catch (error) {
        res.status(404).json({
            message: "Can not create user"
        })
    }
}
