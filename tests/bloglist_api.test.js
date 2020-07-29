const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
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

const defaultUser = { username: 'root', password: 'secret' }

let token
beforeAll(async () => {
  await User.deleteMany({})
  await api.post('/api/users').send(defaultUser)

  const login = await api
    .post('/api/login')
    .send(defaultUser)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  token = login.body.token
  expect(token).toBeDefined()
})

beforeAll(async () => {
  await Blog.deleteMany({})

  const promiseArray = initialBlogs.map((blog) =>
    api.post('/api/blogs').set('Authorization', `bearer ${token}`).send(blog)
  )

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
      .set('Authorization', `bearer ${token}`)
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
      .set('Authorization', `bearer ${token}`)
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

    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newEntry)
      .expect(400)

    const atEnd = await api.get('/api/blogs')

    expect(atEnd.body.length).toBe(atStart.body.length)
  })
})

describe('deletion of a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const atStart = await api.get('/api/blogs')
    const postToDelete = atStart.body[0]

    await api
      .delete(`/api/blogs/${postToDelete.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)

    const atEnd = await api.get('/api/blogs')

    expect(atEnd.body.length).toBe(atStart.body.length - 1)
  })
})

describe('updating of a blog post', () => {
  test('succeed with status code 200', async () => {
    const atStart = await api.get('/api/blogs')
    const postToUpdate = atStart.body[0]

    const updatedPost = {
      ...postToUpdate,
      likes: 100,
    }

    await api
      .put(`/api/blogs/${postToUpdate.id}`)
      .send(updatedPost)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const atEnd = await api.get('/api/blogs')

    expect(atEnd.body[0].likes).toBe(100)
  })
})

describe('when there is initially one user at db', () => {
  test('creation succeeds with a fresh username and valid data', async () => {
    const atStart = await api.get('/api/users')

    const newUser = {
      username: 'test',
      password: 'foobar',
      name: 'User Test',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const atEnd = await api.get('/api/users')

    expect(atEnd.body.length).toBe(atStart.body.length + 1)

    const usernames = atEnd.body.map((u) => u.username)
    expect(usernames).toContain('test')
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const atStart = await api.get('/api/users')

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body.length).toBe(atStart.body.length)
  })

  test('creation fails with proper statuscode and message if username or password are missing', async () => {
    const atStart = await api.get('/api/users')

    const newUser = {
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`password` is required')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body.length).toBe(atStart.body.length)
  })

  test('creation fails with proper statuscode and message if username or password are shorter 3', async () => {
    const atStart = await api.get('/api/users')

    const newUser = {
      name: 'Superuser',
      username: 'te',
      password: 'test',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('minimum allowed length (3)')

    const usersAtEnd = await api.get('/api/users')
    expect(usersAtEnd.body.length).toBe(atStart.body.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
