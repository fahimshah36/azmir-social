const Post = require('../models/Posts')
const User = require('../models/userModel')

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
        const followingTemp = await User.findById(req.user.id).select("following")
        const following = followingTemp.following
        const promises = following.map((user) => {
            return Post.find({ user: user }).populate("user", "profilePicture cover fName lName username").populate("comments.commentedBy", "profilePicture username fName lName cover").sort({ createdAt: -1 })
        })
        const followingPosts = await (await (Promise.all(promises))).flat()
        const userPost = await Post.find({ user: req.user.id }).populate("user", "profilePicture cover fName lName username")
        followingPosts.push(...[...userPost])
        followingPosts.sort((a, b) => {
            return b.createdAt - a.createdAt
        })
        res.json(followingPosts)
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