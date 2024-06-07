const express = require('express')
const router = express.Router()
const { newUser, verifiedUser, login, reVerification, findUser, resetCode, verifyCode } = require('../../controllers/userControllers')
const { authUser } = require('../../middleware/auth')

router.post('/', newUser)
router.post('/activate', authUser, verifiedUser)
router.post('/login', login)
router.post('/reverification', authUser, reVerification)
router.post('/resetpassword', findUser)
router.post('/resetcode', resetCode)
router.post('/verifyresetcode', verifyCode)

module.exports = router