const express = require('express')
const router = express.Router()
const { createPost, getAllPosts, comment, savePost, removePost } = require('../../controllers/postController')
const { authUser } = require('../../middleware/auth')


router.post('/createpost', authUser, createPost)
router.get('/getallposts', authUser, getAllPosts)
router.put('/comment', authUser, comment)
router.put('/savepost/:id', authUser, savePost)
router.delete('/removepost/:id', authUser, removePost)


module.exports = router