const mongoose = require('mongoose')
const Reacts = require('../models/Reacts')
const Users = require('../models/userModel')


exports.reactPost = async (req, res) => {
    try {
        const { postId, react } = req.body
        const check = await Reacts.findOne({
            postId: postId,
            reactBy: req.user.id
        })
        console.log(check);

        if (check === null) {
            const newReact = new Reacts({
                react: react,
                postId: postId,
                reactBy: req.user.id
            })
            await newReact.save()
        } else {
            if (check.react === react) {
                await Reacts.findByIdAndDelete(check._id)
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

exports.getAllReacts = async (req, res) => {
    try {
        const reactArray = await Reacts.find({ postId: req.params.id })
        const check = await Reacts.findOne({
            postId: req.params.id,
            reactBy: req.user.id
        })
        res.json({ reactArray, check: check?.react })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}
