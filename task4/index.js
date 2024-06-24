const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PROJECTS_FILE = 'projects.json';

let projects = [];

try {
    const projectsData = fs.readFileSync(PROJECTS_FILE);
    projects = JSON.parse(projectsData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('projects.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

app.post('/projects', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        return res.status(400).send('Name and description are required');
    }

    const newProject = {
        id: projects.length + 1,
        name,
        description,
        tasks: []
    };

    projects.push(newProject);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(201).json(newProject);
});

app.get('/projects', (req, res) => {
    res.json(projects);
});

app.get('/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) return res.status(404).send('Project not found');
    res.json(project);
});

app.put('/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.id));
    if (!project) return res.status(404).send('Project not found');

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description) project.description = description;

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.json(project);
});

app.delete('/projects/:id', (req, res) => {
    const projectIndex = projects.findIndex(p => p.id === parseInt(req.params.id));
    if (projectIndex === -1) return res.status(404).send('Project not found');

    projects.splice(projectIndex, 1);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(204).send();
});

app.post('/projects/:projectId/tasks', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.projectId));
    if (!project) return res.status(404).send('Project not found');

    const { name, description, deadline } = req.body;
    if (!name || !description || !deadline) {
        return res.status(400).send('Name, description, and deadline are required');
    }

    const newTask = {
        id: project.tasks.length + 1,
        name,
        description,
        deadline
    };

    project.tasks.push(newTask);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(201).json(newTask);
});

app.get('/projects/:projectId/tasks', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.projectId));
    if (!project) return res.status(404).send('Project not found');
    res.json(project.tasks);
});

app.get('/projects/:projectId/tasks/:taskId', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.projectId));
    if (!project) return res.status(404).send('Project not found');

    const task = project.tasks.find(t => t.id === parseInt(req.params.taskId));
    if (!task) return res.status(404).send('Task not found');

    res.json(task);
});

app.put('/projects/:projectId/tasks/:taskId', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.projectId));
    if (!project) return res.status(404).send('Project not found');

    const task = project.tasks.find(t => t.id === parseInt(req.params.taskId));
    if (!task) return res.status(404).send('Task not found');

    const { name, description, deadline } = req.body;
    if (name) task.name = name;
    if (description) task.description = description;
    if (deadline) task.deadline = deadline;

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.json(task);
});

app.delete('/projects/:projectId/tasks/:taskId', (req, res) => {
    const project = projects.find(p => p.id === parseInt(req.params.projectId));
    if (!project) return res.status(404).send('Project not found');

    const taskIndex = project.tasks.findIndex(t => t.id === parseInt(req.params.taskId));
    if (taskIndex === -1) return res.status(404).send('Task not found');

    project.tasks.splice(taskIndex, 1);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    res.status(204).send();
});

app.get('/tasks', (req, res) => {
    const { dueBefore } = req.query;
    if (!dueBefore) return res.status(400).send('Due before date is required');

    const dueDate = new Date(dueBefore);
    if (isNaN(dueDate)) return res.status(400).send('Invalid date format');

    let tasksDue = [];
    projects.forEach(project => {
        tasksDue = tasksDue.concat(
            project.tasks.filter(task => new Date(task.deadline) <= dueDate)
        );
    });

    res.json(tasksDue);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
