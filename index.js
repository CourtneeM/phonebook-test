const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

morgan.token('res-body', (req, res, next) => JSON.stringify({"name": res.body.name, "number": res.body.number}));
app.use(morgan('tiny'));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

const generateId = () => {
  let randomId = Math.round(Math.random() * 1000000);
  while (persons.map((person) => person.id).includes(randomId)) {
    randomId = Math.floor(Math.random() * (1000000 - 1) + 1);
  }

  return randomId;
}

// GET
app.get('/api/persons', (request, response) => {
  response.status(200).json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.status(200).json(person);
  } else {
    response.status(404).end();
  }
});


// POST
const postMorgan = morgan(':method :url :status :res[content-length] - :response-time ms :res-body')

app.post('/api/persons', postMorgan, (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Missing name or number'
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: 'Name already exists in phonebook'
    });
  }
  
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons.push(person);

  response.body = person;

  response.status(201).json(`'${person.name}' has been added to phonebook`);
});


// DELETE
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});


app.get('/info', (request, response) => {
  const numberPersons = persons.length;
  response.status(200).send(`<p>Phonebook has info for ${numberPersons} people <br/> ${new Date()}</p>`);
});

const unkownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'});
}

app.use(unkownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});