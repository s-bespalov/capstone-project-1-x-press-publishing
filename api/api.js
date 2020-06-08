const express = require('express')
const router = express.Router()

const artistRouter = require('./artists')
router.use('/artists', artistRouter)

const seriesRouter = require('./series')
router.use('/series', seriesRouter)

module.exports = router
