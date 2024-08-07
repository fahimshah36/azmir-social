const Post = require('../models/Posts')

exports.createPost = async (req, res) => {
    try {
        const post = await new Post(req.body).save()
        res.json(post)

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}

exports.getAllPosts = async (req, res) => {
    try {
        const post = await Post.find().populate("user", "profilePicture cover fName lName username gender").sort({ createdAt: -1 })
        res.json(post)

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}


exports.comment = async (req, res) => {
    try {
        const { comment, image, postId } = req.body
        const newComment = await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: {
                    comment: comment,
                    image: image,
                    commentedBy: req.user.id,
                    commentedAt: new Date()
                }
            }
        }, {
            new: true
        }).populate("comments.commentedBy", "profilePicture username fName lName")
        res.json(newComment.comments)
    } catch (error) {
        res.status(404).json({
            message: error.message
        })
    }
}