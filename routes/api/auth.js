const express = require('express')
const router = express.Router()
const { newUser, verifiedUser, login, reVerification, findUser, resetCode } = require('../../controllers/userControllers')
const { authUser } = require('../../middleware/auth')

router.post('/', newUser)
router.post('/activate', authUser, verifiedUser)
router.post('/login', login)
router.post('/reverification', authUser, reVerification)
router.post('/resetpassword', findUser)
router.post('/resetcode', resetCode)

module.exports = router