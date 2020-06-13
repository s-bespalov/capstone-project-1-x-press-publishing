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
      function (error) {
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

issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(
    'SELECT * FROM Issue WHERE id = $id',
    { $id: issueId },
    (error, row) => {
      if (error) {
        return res.sendStatus(404)
      }
      req.issue = row
      next()
    }
  )
})

issuesRouter.put('/:issueId', (req, res, next) => {
  const issue = req.body.issue
  const valid = issue.name && issue.publicationDate && issue.issueNumber && issue.artistId
  if (!valid) {
    return res.sendStatus(400)
  }
  db.run(
    `
    UPDATE Issue
    SET name = "${issue.name}",
        issue_number = ${issue.issueNumber},
        publication_date = "${issue.publicationDate}",
        artist_id = ${issue.artistId}
    WHERE id = ${req.issue.id}
    `,
    (error) => {
      if (error) {
        return next(error)
      }
      db.get('SELECT * FROM Issue WHERE id = $id', { $id: req.issue.id }, (error, row) => {
        if (error) {
          return next(error)
        }
        res.status(200).json({ issue: row })
      })
    }
  )
})

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run('DELETE FROM Issue WHERE id = $id', { $id: req.issue.id }, (error) => {
    if (error) {
      return next(error)
    }
    res.sendStatus(204)
  })
})

module.exports = issuesRouter
