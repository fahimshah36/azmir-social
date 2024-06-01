const express = require('express')
const router = express.Router()
const { newUser, verifiedUser, login, reVerification } = require('../../controllers/userControllers')
const { authUser } = require('../../middleware/auth')

router.post('/', newUser)
router.post('/activate', authUser, verifiedUser)
router.post('/login', login)
router.post('/reverification', authUser, reVerification)

module.exports = router