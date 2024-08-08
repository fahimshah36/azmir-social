const mongoose = require('mongoose')
const Reacts = require('../models/Reacts')
const User = require('../models/userModel')


exports.reactPost = async (req, res) => {
    try {
        const { postId, react } = req.body
        const check = await Reacts.findOne({
            postId: postId,
            reactBy: req.user.id
        })

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

        let newReacts = reactArray.reduce((group, react) => {
            let key = react["react"]
            group[key] = group[key] || []
            group[key].push(react)
            return group
        }, {})


        const AllReacts = [
            {
                react: "love",
                count: newReacts.love ? newReacts.love.length : 0
            },
            {
                react: "haha",
                count: newReacts.haha ? newReacts.haha.length : 0
            },
            {
                react: "Wow",
                count: newReacts.Wow ? newReacts.Wow.length : 0
            },
            {
                react: "sad",
                count: newReacts.sad ? newReacts.sad.length : 0
            },
            {
                react: "angry",
                count: newReacts.angry ? newReacts.angry.length : 0
            },
            {
                react: "like",
                count: newReacts.like ? newReacts.like.length : 0
            },
        ]

        // check if post is already saved or not
        const user = await User.findById(req.user.id)
        const isPostSave = user?.savePost.find((x) => x.post.toString() == req.params.id)

        res.json({ AllReacts, check: check?.react, total: reactArray.length, isPostSave: isPostSave ? true : false })
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}
