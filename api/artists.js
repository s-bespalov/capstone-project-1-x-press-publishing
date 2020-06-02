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
      req.artistId = row.id
      req.artist = row
      next()
    } else {
      res.sendStatus(404)
    }
  })
})

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({ artist: req.artist })
})

artistsRouter.post('/', (req, res, next) => {
  const artist = req.body.artist
  const valid = artist.name && artist.dateOfBirth && artist.biography
  if (valid) {
    if (!artist.is_currently_employed) {
      artist.is_currently_employed = 1
    }
    db.run(`
      INSERT INTO Artist 
        (
          name, 
          date_of_birth, 
          biography, 
          is_currently_employed
        )
      VALUES
        (
          "${artist.name}",
          "${artist.dateOfBirth}",
          "${artist.biography}",
          ${artist.is_currently_employed}
        )
    `, function (error) {
      if (error) {
        next(error)
      } else {
        db.get('SELECT * FROM Artist WHERE id = $id', { $id: this.lastID }, (error, row) => {
          if (error) {
            next(error)
          } else if (row) {
            res.status(201).json({ artist: row })
          }
        })
      }
    })
  } else {
    res.sendStatus(400)
  }
})

artistsRouter.put('/:artistId', (req, res, next) => {
  const artist = req.body.artist
  const valid = artist.name && artist.dateOfBirth && artist.biography
  if (valid) {
    if (!artist.is_currently_employed) {
      artist.is_currently_employed = 1
    }
    db.run(`
      UPDATE Artist
      SET name = "${artist.name}",
          date_of_birth = "${artist.dateOfBirth}",
          biography = "${artist.biography}",
          is_currently_employed = ${artist.is_currently_employed}
      WHERE id = ${req.artistId}
    `, (error) => {
      if (error) {
        next(error)
      } else {
        db.get('SELECT * FROM Artist WHERE id = $id', { $id: req.artistId }, (error, row) => {
          if (error) {
            next(error)
          } else {
            res.status(200).send({ artist: row })
          }
        })
      }
    })
  } else {
    res.sendStatus(400)
  }
})

module.exports = artistsRouter
