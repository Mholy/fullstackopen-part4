const config = require('./utils/config')
const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const bloglistRouter = require('./controllers/bloglist')

app.use(cors())
app.use(bodyParser.json())

app.use('/api/blogs', bloglistRouter)

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`)
})
