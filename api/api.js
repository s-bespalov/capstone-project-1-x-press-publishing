const express = require('express')
const router = express.Router()

const artistRouter = require('./artists')
router.use('/artists', artistRouter)

module.exports = router
