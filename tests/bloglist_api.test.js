const mongoose = require('mongoose')
const Blog = require('../models/blog')
const app = require('../app')
const supertest = require('supertest')
const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url:
      'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
]

beforeAll(async () => {
  await Blog.deleteMany({})

  const blogObjects = initialBlogs.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())

  await Promise.all(promiseArray)
})

describe('when there is initially some notes saved', () => {
  test('bloglist entries are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('app returns correct amount of blog entries', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(initialBlogs.length)
  })

  test('id is present', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
  })
})

describe('addition of a new blog entry', () => {
  test('succeeds with valid data', async () => {
    const atStart = await api.get('/api/blogs')

    const newEntry = {
      title: 'Test',
      author: 'Jest',
      url: 'http://url',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newEntry)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const atEnd = await api.get('/api/blogs')

    expect(atEnd.body.length).toBe(atStart.body.length + 1)
  })

  test('when likes is missing, it will default to the value 0', async () => {
    const newEntry = {
      title: 'Test',
      author: 'Jest',
      url: 'http://url',
    }

    const createdEntry = await api
      .post('/api/blogs')
      .send(newEntry)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(createdEntry.body.likes).toBe(0)
  })

  test('fails with status code 400 if data invalid', async () => {
    const atStart = await api.get('/api/blogs')

    const newEntry = {
      url: 'http://url',
    }

    await api.post('/api/blogs').send(newEntry).expect(400)

    const atEnd = await api.get('/api/blogs')
    console.log(atEnd.body)

    expect(atEnd.body.length).toBe(atStart.body.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
