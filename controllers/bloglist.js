const bloglistRouter = require('express').Router()
const Blog = require('../models/blog')

bloglistRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

bloglistRouter.post('/', async (request, response) => {
  const body = request.body
  const blog = new Blog({ ...body, likes: body.likes || 0 })

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog.toJSON()).end()
  } catch (error) {
    response.status(400).end()
  }
})

bloglistRouter.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (err) {
    res.status(400).end()
  }
})

bloglistRouter.put('/:id', async (req, res) => {
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
    res.json(updatedPost.toJSON()).end()
  } catch (err) {
    res.status(400).end()
  }
})

module.exports = bloglistRouter
