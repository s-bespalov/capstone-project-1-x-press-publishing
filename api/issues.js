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

issuesRouter.post('/', (req, res, next) => {
  const issue = req.body.issue
  const valid = issue.name && issue.issueNumber && issue.publicationDate && issue.artistId
  if (!valid) {
    console.log('here', issue, valid)
    return res.sendStatus(400)
  }
  db.get(
    'SELECT * FROM Artist WHERE id = $id',
    { $id: issue.artistId },
    (error, row) => {
      if (error) {
        return next(error)
      }
      if (!row) {
        return res.sendStatus(400)
      }
      db.run(`
        INSERT INTO Issue (
          name, issue_number, publication_date, artist_id, series_id
        )
        VALUES (
          "${issue.name}", ${issue.issueNumber}, "${issue.publicationDate}", ${issue.artistId}, ${req.series.id}
        )
      `,
      function(error) {
        if (error) {
          return next(error)
        }
        db.get('SELECT * FROM Issue WHERE id = $id', { $id: this.lastID }, (error, row) => {
          if (error) {
            return next(error)
          }
          res.status(201).json({ issue: row })
        })
      }
      )
    }
  )
})

module.exports = issuesRouter
