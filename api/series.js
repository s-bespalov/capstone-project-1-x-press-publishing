const express = require('express')
const seriesRouter = express.Router()

const sqlite = require('sqlite3')
const dbPath = process.env.TEST_DATABASE || './database.sqlite'
const db = new sqlite.Database(dbPath)

seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (error, rows) => {
    if (error) {
      return next(error)
    }

    res.status(200).json({ series: rows })
  })
})

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get(
    'SELECT * FROM Series WHERE id = $id',
    { $id: seriesId },
    (error, row) => {
      if (error) {
        return next(error)
      }
      if (!row) {
        return res.sendStatus(404)
      }
      req.series = row
      next()
    })
})

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({ series: req.series })
})

seriesRouter.post('/', (req, res, next) => {
  const series = req.body.series
  if (!series.name || !series.description) {
    return res.sendStatus(400)
  }
  db.run(`
    INSERT INTO Series
      (
        name,
        description
      )
    VALUES
      (
        "${series.name}",
        "${series.description}"
      )
  `, function (error) {
    if (error) {
      return next(error)
    }
    db.get(
      'SELECT * FROM Series WHERE id = $id',
      { $id: this.lastID },
      (error, row) => {
        if (error) {
          return next(error)
        }
        res.status(201).json({ series: row })
      }
    )
  })
})

seriesRouter.put('/:seriesId', (req, res, next) => {
  const series = req.body.series
  if (!series.name || !series.description) {
    return res.sendStatus(400)
  }
  db.run(
    `
    UPDATE Series
    SET name = "${series.name}",
        description = "${series.description}"
    WHERE id = ${req.series.id}
    `,
    (error) => {
      if (error) {
        return next(error)
      }
      db.get(
        'SELECT * FROM Series WHERE id = $id',
        { $id: req.series.id },
        (error, row) => {
          if (error) {
            return next(error)
          }
          res.status(200).json({ series: row })
        }
      )
    }
  )
})

module.exports = seriesRouter
