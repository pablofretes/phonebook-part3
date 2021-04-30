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

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>PhoneBook<h1/>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const personsTotal = persons.length
    let today = new Date().toString()
    console.log(personsTotal)
    response.send(`<p>Phonebook has info for ${personsTotal} people<p/> <br><br/> <p>${today}<p/>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
        return person.id === id
    })
    if(person){
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})
const newId = () => {
    const aNewId = Math.ceil(Math.random() * 100000000000000)
    return aNewId
}
app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name){
        return response.status(400).json({
            error: 'name missing'
        })
    }

    if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if(persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())){
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: newId()
    }

    persons = persons.concat(person)
    response.json(person)
})

morgan(function (tokens, req, res){
    return [tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens[response-time](req, res), 'ms'].join(' ')
})

morgan.token('POSTData', (req) => {
    if(req.method == 'POST') {
        return JSON.stringify(req.body)
    } else {
        return null
    }
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})