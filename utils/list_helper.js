const _ = require('lodash')

const dummy = blogs => 1

const totalLikes = blogs => {
    return blogs
        .map(blog => blog.likes)
        .reduce((acc, curr) => {
            return acc + curr
        }, 0)
}

const favoriteBlog = blogs => {
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

const mostBlogs = blogs => {
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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
}
