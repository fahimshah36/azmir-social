const express = require('express')
const router = express.Router()
const { newUser, verifiedUser, login } = require('../../controllers/userControllers')
const { authUser } = require('../../middleware/auth')

router.post('/', newUser)
router.post('/activate', verifiedUser)
router.post('/login', login)

module.exports = router