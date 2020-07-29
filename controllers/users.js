const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs', { user: 0, likes: 0 })
  res.json(users)
})

usersRouter.post('/', async (req, res, next) => {
  const body = req.body

  if (!body.password || !body.password.length) {
    return res.status(400).json({ error: '`password` is required' })
  }

  if (body.password.length < 3) {
    return res.status(400).json({ error: 'minimum allowed length (3)' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    password: passwordHash,
    name: body.name,
  })

  try {
    const savedUser = await user.save()
    res.json(savedUser)
  } catch (err) {
    next(err)
  }
})

module.exports = usersRouter
