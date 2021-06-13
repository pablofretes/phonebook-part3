require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }).then(() => console.log('Connected to MongoDB'))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
      },
    number:{
        type: String,
        minLength: 8,
        required: true
    }
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: process.argv[2],
    number: process.argv[3],
})

if(process.argv[2] && process.argv[3]){
    person.save().then(() => {
        console.log(`Added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log('Phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(person)
        })
        mongoose.connection.close()
    })
}