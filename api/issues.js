const express = require('express')
const issuesRouter = express.Router({ mergeParams: true })
const sqlite3 = require('sqlite3')
const dbPath = process.env.TEST_DATABASE || './database.sqlite'
const db = new sqlite3.Database(dbPath)

issuesRouter.get('/', (req, res, next) => {
  db.all(
    'SELECT * FROM Issue WHERE series_id=$id',
    { $id: req.series.id },
    (error, rows) => {
      if (error) {
        return next(error)
      }
      res.status(200).json({ issues: rows })
    }
  )
})

module.exports = issuesRouter
