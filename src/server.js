const express = require('express');
const modules = require('./modules');
const auth = require('./auth');

const app = express();
app.use(express.json());

// Projects
app.post('/projects', async (req, res) => {
  const p = await modules.createProject(req.body);
  res.json(p);
});

app.get('/projects/:id', async (req, res) => {
  const p = await modules.getProject(req.params.id);
  res.json(p);
});

app.put('/projects/:id', async (req, res) => {
  const p = await modules.updateProject(req.params.id, req.body);
  res.json(p);
});

app.delete('/projects/:id', async (req, res) => {
  const p = await modules.deleteProject(req.params.id);
  res.json(p);
});

app.get('/projects/:id/time', async (req, res) => {
  const t = await modules.calculateProjectTime(req.params.id);
  res.json(t);
});

// Tasks
app.post('/tasks', async (req, res) => {
  const t = await modules.createTask(req.body);
  res.json(t);
});

app.get('/tasks/:id', async (req, res) => {
  const t = await modules.getTask(req.params.id);
  res.json(t);
});

app.put('/tasks/:id', async (req, res) => {
  const t = await modules.updateTask(req.params.id, req.body);
  res.json(t);
});

app.delete('/tasks/:id', async (req, res) => {
  const t = await modules.deleteTask(req.params.id);
  res.json(t);
});

app.get('/tasks/:id/time', async (req, res) => {
  const t = await modules.calculateTaskTime(req.params.id);
  res.json(t);
});

// Pauses
app.post('/pauses', async (req, res) => {
  const p = await modules.startPause(req.body);
  res.json(p);
});

app.post('/pauses/:id/end', async (req, res) => {
  const p = await modules.endPause(req.params.id);
  res.json(p);
});

// Auth
app.post('/auth/register', async (req, res) => {
  try {
    const user = await auth.register(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/auth/register', async (req, res) => {
  try {
    const user = await auth.register(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const result = await auth.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Users
app.get('/users', async (req, res) => {
  try {
    const users = await auth.listUsers();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await auth.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
