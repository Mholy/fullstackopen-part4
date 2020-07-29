const _ = require('lodash')

const dummy = (blogs) => 1

const totalLikes = (blogs) => {
  return blogs
    .map((blog) => blog.likes)
    .reduce((acc, curr) => {
      return acc + curr
    }, 0)
}

const favoriteBlog = (blogs) => {
  let max = 0
  let maxIndex = 0
  blogs.forEach((blog, i) => {
    if (blog.likes > max) {
      max = blog.likes
      maxIndex = i
    }
  })
  const mostFavorited = blogs[maxIndex] ? { ...blogs[maxIndex] } : 0
  delete mostFavorited._id
  delete mostFavorited.url
  delete mostFavorited.__v
  return mostFavorited
}

const mostBlogs = (blogs) => {
  let max = 0
  let author = ''
  let result = 0
  const qtyAuthorBlogs = _.countBy(blogs, 'author')
  _.forIn(qtyAuthorBlogs, (value, key) => {
    if (value > max) {
      author = key
      max = value
    }
  })
  if (author) {
    result = {
      author: author,
      blogs: max,
    }
  }
  return result
}

const mostLikes = (blogs) => {
  const byAuthor = _.groupBy(blogs, 'author')
  let max = 0
  let mostLikes

  for (let author in byAuthor) {
    byAuthor[author] = byAuthor[author].reduce((prev, curr) => ({
      author: curr.author,
      likes: prev.likes + curr.likes,
    }))

    if (byAuthor[author].likes > max) {
      mostLikes = byAuthor[author]
      max = byAuthor[author].likes
    }
  }

  return mostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
