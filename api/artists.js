const express = require('express')
const artistsRouter = express.Router()

const sqlite = require('sqlite3')
const dbPath = process.env.TEST_DATABASE || '../database.qlite'
const db = new sqlite.Database(dbPath)

artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, rows) => {
    if (error) {
      next(error)
    } else {
      res.status(200).json({ artists: rows })
    }
  })
})

artistsRouter.param('artistId', (req, res, next, id) => {
  db.get('SELECT * FROM Artist WHERE id = $id', { $id: id }, (error, row) => {
    if (error) {
      next(error)
    } else if (row) {
      req.artistId = id
      next()
    } else {
      res.sendStatus(404)
    }
  })
})

module.exports = artistsRouter
