const jwt = require('jsonwebtoken')
const bloglistRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

bloglistRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { blogs: 0 })
  response.json(blogs)
})

bloglistRouter.post('/', async (request, response, next) => {
  const body = request.body

  if (!request.token) {
    return response.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      ...body,
      likes: body.likes || 0,
      user: user.id,
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

bloglistRouter.delete('/:id', async (req, res, next) => {
  if (!req.token) {
    return res.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)

    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(req.params.id)

    if (blog.user.toString() === user.id.toString()) {
      await blog.remove()
    } else {
      return res.status(403).end()
    }

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

bloglistRouter.put('/:id', async (req, res, next) => {
  const body = req.body

  const post = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  try {
    const updatedPost = await Blog.findByIdAndUpdate(req.params.id, post, {
      new: true,
    })
    res.json(updatedPost)
  } catch (err) {
    next(err)
  }
})

module.exports = bloglistRouter
