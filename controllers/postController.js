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
        const post = await Post.find()
        res.json(post)

    } catch (err) {
        res.status(404).json({
            message: err.message
        })
    }
}
