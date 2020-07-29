const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userScheme = mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
  },
  name: String,
})

userScheme.plugin(uniqueValidator)

userScheme.set('toJSON', {
  transform(document, returnedObject) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.password
  },
})

module.exports = mongoose.model('User', userScheme)
