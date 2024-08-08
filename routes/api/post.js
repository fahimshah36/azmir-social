const express = require('express')
const router = express.Router()
const { createPost, getAllPosts, comment, savePost } = require('../../controllers/postController')
const { authUser } = require('../../middleware/auth')


router.post('/createpost', authUser, createPost)
router.get('/getallposts', authUser, getAllPosts)
router.put('/comment', authUser, comment)
router.put('/savepost/:id', authUser, savePost)


module.exports = router