const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const USERS_FILE = 'users.json';

let users = [];

try {
    const data = fs.readFileSync(USERS_FILE);
    users = JSON.parse(data);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('users.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

app.get('/', (req, res) => {
    res.send('Hello from backend');
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

app.post('/users', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        profile: {}
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    const { name, email, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json(user);
});

app.delete('/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).send('User not found');

    users.splice(userIndex, 1);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(204).send();
});

app.post('/users/:id/profile', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    const { bio, profilePicture } = req.body;
    user.profile = { bio, profilePicture };

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(201).json(user.profile);
});

app.get('/users/:id/profile', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    res.json(user.profile);
});

app.put('/users/:id/profile', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    const { bio, profilePicture } = req.body;
    if (bio) user.profile.bio = bio;
    if (profilePicture) user.profile.profilePicture = profilePicture;

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json(user.profile);
});

app.delete('/users/:id/profile', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    user.profile = {};

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.status(204).send();
});

app.put('/users/:id/profile/picture', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    const { profilePicture } = req.body;
    if (!profilePicture) return res.status(400).send('Profile picture URL is required');

    user.profile.profilePicture = profilePicture;

    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json(user.profile);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
