const Users = require('../models/userModel')
const { validateEmail, validateLength, validateUsername } = require('../helpers/validation')
const bcrypt = require('bcrypt');
const { jwToken } = require('../helpers/token');
const jwt = require('jsonwebtoken')
const { sendVerifiedEmail, sendResetCode } = require('../helpers/mailer');
const Code = require('../models/Code');
const { generateCode } = require('../helpers/generatCode');
const Posts = require('../models/Posts');
const { request } = require('express');

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
            cover: user.cover,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            friends: user.friends,
            followers: user.followers,
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
            cover: user.cover,
            fName: user.fName,
            lName: user.lName,
            email: user.email,
            friends: user.friends,
            followers: user.followers,
            token: token,
            verified: user.verified,
            message: "Login success"
        })
    } catch (err) {
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

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.findUser = async (req, res) => {
    try {
        const { email } = req.body
        const matchEmail = await Users.findOne({ email }).select("-password")
        if (!matchEmail) {
            return res.status(404).json({
                message: "Email doesn't exist"
            })
        }
        res.status(200).json({
            email: matchEmail.email,
            profilePicture: matchEmail.profilePicture
        })
    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.resetCode = async (req, res) => {
    try {
        const { email } = req.body
        const user = await Users.findOne({ email }).select("-password");
        await Code.findOneAndDelete({ user: user._id })
        const code = generateCode(5)
        const saveCode = await new Code({
            user: user._id,
            code
        }).save()

        sendResetCode(user.email, user.fName, code)
        return res.status(200).json({
            message: "Reset code has been sent to your email"
        })

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.verifyCode = async (req, res) => {
    try {
        const { email, code } = req.body
        const user = await Users.findOne({ email })
        const decode = await Code.findOne({ user: user._id })

        if (decode.code !== code) {
            return res.status(404).json({
                message: "Code doesn't matched"
            })
        }
        return res.status(200).json({
            message: "Thank you"
        })

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const { email, password } = req.body
        const cryptedPassword = await bcrypt.hash(password, 10)
        await Users.findOneAndUpdate({ email }, { password: cryptedPassword })
        return res.status(200).json({
            message: "Password successfully changed"
        })

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.getUser = async (req, res) => {
    try {
        const { username } = req.params
        const user = await Users.findById(req.user.id)
        const getProfile = await Users.findOne({ username }).select("-password")
        const friendShip = {
            friend: false,
            following: false,
            request: false,
            requestReceived: false
        }
        if (!getProfile) {
            return res.json({
                ok: false
            })
        }

        if (
            user.friends.includes(getProfile._id) &&
            getProfile.friends.includes(user._id)
        ) {
            friendShip.friend = true
        }

        if (user.following.includes(getProfile._id)) {
            friendShip.following = true
        }

        if (getProfile.request.includes(user._id)) {
            friendShip.request = true
        }

        if (user.request.includes(getProfile._id)) {
            friendShip.requestReceived = true
        }

        const posts = await Posts.find({ user: getProfile._id }).populate("user").populate("comments.commentedBy", "profilePicture username fName lName").sort({ createdAt: -1 })


        await getProfile.populate("friends", "fName lName username profilePicture")

        res.json({ ...getProfile.toObject(), posts, friendShip });

    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.updateProfilePicture = async (req, res) => {
    try {
        const { url } = req.body
        await Users.findByIdAndUpdate(req.user.id, {
            profilePicture: url
        })
        res.json(url)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.updateCoverPicture = async (req, res) => {
    try {
        const { url } = req.body
        await Users.findByIdAndUpdate(req.user.id, {
            cover: url
        })
        res.json(url)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.updateDetails = async (req, res) => {
    try {
        const { infos } = req.body
        const update = await Users.findByIdAndUpdate(req.user.id, {
            details: infos
        }, {
            new: true
        })
        res.send(update.details)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.addFriend = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let sender = await Users.findById(req.user.id)
            let receiver = await Users.findById(req.params.id)

            if (!receiver.friends.includes(sender._id) && !receiver.request.includes(sender._id)) {
                await receiver.updateOne({
                    $push: { request: sender._id }
                })
                await receiver.updateOne({
                    $push: { followers: sender._id }
                })
                await sender.updateOne({
                    $push: { following: receiver._id }
                })
                res.json({ message: "Friend request has been sent" })
            } else {
                return res.json({ message: "Already friend" })
            }
        } else {
            return res.json({
                message: "You can't send request to your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.cancelRequest = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let sender = await Users.findById(req.user.id)
            let receiver = await Users.findById(req.params.id)

            if (!receiver.friends.includes(sender._id) && receiver.request.includes(sender._id)) {
                await receiver.updateOne({
                    $pull: { request: sender._id }
                })
                await receiver.updateOne({
                    $pull: { followers: sender._id }
                })
                await sender.updateOne({
                    $pull: { following: receiver._id }
                })
                res.json({ message: "Cancel request" })
            } else {
                return res.json({ message: "Already canceled" })
            }
        } else {
            return res.json({
                message: "You can't cancel request to your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.follow = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let sender = await Users.findById(req.user.id)
            let receiver = await Users.findById(req.params.id)

            if (!receiver.followers.includes(sender._id) && !sender.following.includes(receiver._id)) {
                await receiver.updateOne({
                    $push: { followers: sender._id }
                })
                await sender.updateOne({
                    $push: { following: receiver._id }
                })
                res.json({ message: "Successfully follow" })
            } else {
                return res.json({ message: "Already followed" })
            }
        } else {
            return res.json({
                message: "You can't follow your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.unFollow = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let sender = await Users.findById(req.user.id)
            let receiver = await Users.findById(req.params.id)

            if (receiver.followers.includes(sender._id) && sender.following.includes(receiver._id)) {
                await receiver.updateOne({
                    $pull: { followers: sender._id }
                })
                await sender.updateOne({
                    $pull: { following: receiver._id }
                })
                res.json({ message: "Successfully unfollow" })
            } else {
                return res.json({ message: "Already unfollowed" })
            }
        } else {
            return res.json({
                message: "You can't unfollow your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.acceptRequest = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let receiver = await Users.findById(req.user.id)
            let sender = await Users.findById(req.params.id)

            if (receiver.request.includes(sender._id)) {

                await Users.findByIdAndUpdate(receiver._id, {
                    $push: { friends: sender._id, following: sender._id }
                }, { new: true })

                await Users.findByIdAndUpdate(sender._id, {
                    $push: { friends: receiver._id, followers: receiver._id }
                }, { new: true })

                await receiver.updateOne({
                    $pull: { request: sender._id }
                })
                res.json({ message: "Request accepted" })
            } else {
                return res.json({ message: "Already friend" })
            }
        } else {
            return res.json({
                message: "You can't accept request your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.unFriend = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let sender = await Users.findById(req.user.id)
            let receiver = await Users.findById(req.params.id)

            if (receiver.friends.includes(sender._id) && sender.friends.includes(receiver._id)) {
                await Users.findByIdAndUpdate(receiver._id, { $pull: { friends: sender._id, following: sender._id, followers: sender._id } }, { new: true })

                await Users.findByIdAndUpdate(sender._id, { $pull: { friends: receiver._id, following: receiver._id, followers: receiver._id } }, { new: true })

                res.json({ message: "Unfriend" })
            } else {
                return res.json({ message: "Already unfriend" })
            }
        } else {
            return res.json({
                message: "You can't unfriend your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.deleteRequest = async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            let receiver = await Users.findById(req.user.id)
            let sender = await Users.findById(req.params.id)

            if (receiver.request.includes(sender._id)) {
                await Users.findByIdAndUpdate(receiver._id, { $pull: { request: sender._id, followers: sender._id } }, { new: true })
                await sender.updateOne({
                    $pull: { following: receiver._id }
                })
                res.json({ message: "Request delete" })
            } else {
                return res.json({ message: "Already deleted" })
            }
        } else {
            return res.json({
                message: "You can't delete request your self"
            })
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.search = async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;
        const search = await Users.find({ $text: { $search: searchTerm } }).select("fName lName username profilePicture")
        res.json(search)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}

exports.addSearchHistory = async (req, res) => {
    try {
        const { searchUser } = req.body
        const search = {
            user: searchUser,
            createdAt: new Date()
        }
        const user = await Users.findById(req.user.id)
        const check = user.search.find((x) => x.user.toString() == searchUser)

        if (check) {
            await Users.updateOne(
                {
                    _id: req.user.id,
                    "search._id": check._id
                }, {
                $set: {
                    "search.$.createdAt": new Date()
                }
            }
            )
        }
        else {
            await Users.findByIdAndUpdate(req.user.id, {
                $push: {
                    search
                }
            })
        }

    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}



