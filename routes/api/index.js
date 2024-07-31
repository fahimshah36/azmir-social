const express = require('express')
const router = express.Router()
const auth = require('./auth.js')
const allPost = require('./post.js')
const upload = require('./upload.js')
const react = require('./Reacts.js')

router.use('/auth', auth)
router.use('/posts', allPost)
router.use('/upload', upload)
router.use('/reacts', react)

module.exports = router