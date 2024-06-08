const express = require('express')
const router = express.Router()
const { createPost } = require('../../controllers/postController')

router.post('/createpost', createPost)


module.exports = router