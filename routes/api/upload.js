const express = require('express')
const { uploadImages, listImage } = require('../../controllers/upload')
const uploadMiddleware = require('../../middleware/uploadMiddleware')
const router = express.Router()

router.post('/uploadimage', uploadMiddleware, uploadImages)
router.get('/listimage', listImage)


module.exports = router