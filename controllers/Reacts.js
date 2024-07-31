const mongoose = require('mongoose')
const Reacts = require('../models/Reacts')
const Users = require('../models/userModel')


exports.reactPost = async (req, res) => {
    try {
        const { postId, react } = req.body
        const check = await Reacts.findOne({
            postId: postId,
            reactBy: mongoose.Types.ObjectId(req.user.id)
        })

        if (check === null) {
            const newReact = new Reacts({
                react: react,
                postRef: postId,
                reactBy: req.user.id
            })
            await newReact.save()
        } else {
            if (check.react === react) {
                await Reacts.findByIdAndRemove(check._id)
            } else {
                await Reacts.findByIdAndUpdate(check._id, {
                    react: react
                })
            }
        }
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}
