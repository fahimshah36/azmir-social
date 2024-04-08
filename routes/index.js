const express = require('express')
const router = express.Router()
const api = require('./api')

const baseAPI = process.env.BASE_API_URL

router.use(baseAPI, api)

module.exports = router