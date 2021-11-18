const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'User not found' });
  }

  request.user = user;

  return next()

}

app.post('/users', (request, response) => {
  const { name , username} = request.body;

  const usernameExists = users.some(user => user.username === username);

  if(usernameExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos:[]
  });

  return response.status(201).json({
    id: uuidv4(),
    name,
    username,
    todos:[]
  });
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;
  const { user } = request;

  const id = uuidv4();
  user.todos.push({
    title,
    deadline: new Date(deadline),
    id: id,
    done: false,
    created_at: new Date(),
  });

  return response.status(201).json({
    title,
    deadline: new Date(deadline),
    id: id,
    done: false,
    created_at: new Date(),
  });

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {id} = request.params;
  const { user } = request;

  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }
  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const { user } = request;

  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }
  findTodo.done = true;
  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const { user } = request;

  const findTodo = user.todos.find(todo => todo.id === id);
  if(!findTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }
  user.todos.splice(user.todos.findIndex(todo => todo.id === id), 1);

  return response.status(204).json(user.todo);
});

module.exports = app;