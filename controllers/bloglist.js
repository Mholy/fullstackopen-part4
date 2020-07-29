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

module.exports = bloglistRouter
