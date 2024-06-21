const express = require('express')
const { uploadImages, listImage } = require('../../controllers/upload')
const uploadMiddleware = require('../../middleware/uploadMiddleware')
const { authUser } = require('../../middleware/auth')
const router = express.Router()

router.post('/uploadimage', authUser, uploadMiddleware, uploadImages)
router.post('/listimage', authUser, listImage)


module.exports = router