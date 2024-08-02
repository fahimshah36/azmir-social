const express = require('express')
const { authUser } = require('../../middleware/auth')
const { reactPost, getAllReacts } = require('../../controllers/Reacts')
const router = express.Router()

router.put('/reactpost', authUser, reactPost)
router.get('/getallreacts/:id', authUser, getAllReacts)


module.exports = router