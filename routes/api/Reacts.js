const express = require('express')
const { authUser } = require('../../middleware/auth')
const { reactPost } = require('../../controllers/Reacts')
const router = express.Router()

router.put('/reactpost', authUser, reactPost)


module.exports = router