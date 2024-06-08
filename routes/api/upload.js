const express = require('express')
const { uploadImages } = require('../../controllers/upload')
const uploadMiddleware = require('../../middleware/uploadMiddleware')
const router = express.Router()

router.post('/uploadimage', uploadMiddleware, uploadImages)


module.exports = router