const router = require('express').Router()
const {User} = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    if (req.user.administrator) {
      const users = await User.findAll({
        // explicitly select only the id and email fields - even though
        // users' passwords are encrypted, it won't help if we just
        // send everything to anyone who asks!
        attributes: ['id', 'email']
      })
      res.json(users)
    } else {
      res.sendStatus(401)
    }
  } catch (err) {
    next(err)
  }
})

router.get('/me', (req, res, next) => {
  try {
    const user = req.user
    if (!user) res.sendStatus(401)
    else res.json(user)
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email
      }
    })

    if (!user) {
      res.sendStatus(404)
    } else if (!user.correctPassword(req.body.password)) {
      res.sendStatus(404)
    } else {
      req.login(user, err => (err ? next(err) : res.json(user)))
    }
  } catch (error) {
    next(error)
  }
})

router.post('/signup', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    req.login(user, err => (err ? next(err) : res.json(user)))
  } catch (error) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(error)
    }
  }
})

router.delete('/logout', (req, res, next) => {
  try {
    req.session.destroy()
    req.logout()
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})
