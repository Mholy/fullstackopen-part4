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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
}
