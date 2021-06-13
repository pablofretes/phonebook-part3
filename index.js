require('dotenv').config()
const express = require('express')
const { response } = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':POSTData'))
app.use(cors())
app.use(express.static('build'))
const Person = require('./models/person')

app.get('/', (request, response) => {
    response.send('<h1>PhoneBook<h1/>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    let today = new Date().toString()

    Person.find({}).then(results => {
        response.send(`<p>Phonebook has info for ${results.length} people<p/> <br><br/> <p>${today}<p/>`)})
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(result => {
            if(result){
                return response.json(result)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({ error: 'name missing' })
    }

    if(!body.number){
        return response.status(400).json({ error: 'number missing' })
    }

    const person = new Person ({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedPersonJSON => {
            response.json(savedPersonJSON)
        })
        .catch(error => {
            console.log(error.response.data)
            next(error)
        })

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const id = request.params.id
    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

morgan(function (tokens, req, res){
    return [tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens[response-time](req, res), 'ms'].join(' ')
})

morgan.token('POSTData', (req) => {
    if(req.method === 'POST') {
        return JSON.stringify(req.body)
    } else {
        return null
    }
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({ error: 'malformatted id' })
    } else if(error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})