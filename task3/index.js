const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const POSTS_FILE = 'posts.json';

let posts = [];

try {
    const postsData = fs.readFileSync(POSTS_FILE);
    posts = JSON.parse(postsData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('posts.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

app.post('/posts', (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
        return res.status(400).send('Title, content, and author are required');
    }

    const newPost = {
        id: posts.length + 1,
        title,
        content,
        author,
        comments: [],
        likes: 0
    };

    posts.push(newPost);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(201).json(newPost);
});

app.get('/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedPosts = posts.slice(startIndex, endIndex);
    res.json({
        page,
        limit,
        total: posts.length,
        posts: paginatedPosts
    });
});

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');
    res.json(post);
});

app.put('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');

    const { title, content, author } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (author) post.author = author;

    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.json(post);
});

app.delete('/posts/:id', (req, res) => {
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
    if (postIndex === -1) return res.status(404).send('Post not found');

    posts.splice(postIndex, 1);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(204).send();
});

app.post('/posts/:postId/comments', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.postId));
    if (!post) return res.status(404).send('Post not found');

    const { content, author } = req.body;
    if (!content || !author) {
        return res.status(400).send('Content and author are required');
    }

    const newComment = {
        id: post.comments.length + 1,
        content,
        author
    };

    post.comments.push(newComment);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(201).json(newComment);
});

app.get('/posts/:postId/comments', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.postId));
    if (!post) return res.status(404).send('Post not found');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedComments = post.comments.slice(startIndex, endIndex);
    res.json({
        page,
        limit,
        total: post.comments.length,
        comments: paginatedComments
    });
});

app.get('/posts/:postId/comments/:commentId', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.postId));
    if (!post) return res.status(404).send('Post not found');

    const comment = post.comments.find(c => c.id === parseInt(req.params.commentId));
    if (!comment) return res.status(404).send('Comment not found');

    res.json(comment);
});

app.put('/posts/:postId/comments/:commentId', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.postId));
    if (!post) return res.status(404).send('Post not found');

    const comment = post.comments.find(c => c.id === parseInt(req.params.commentId));
    if (!comment) return res.status(404).send('Comment not found');

    const { content, author } = req.body;
    if (content) comment.content = content;
    if (author) comment.author = author;

    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.json(comment);
});

app.delete('/posts/:postId/comments/:commentId', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.postId));
    if (!post) return res.status(404).send('Post not found');

    const commentIndex = post.comments.findIndex(c => c.id === parseInt(req.params.commentId));
    if (commentIndex === -1) return res.status(404).send('Comment not found');

    post.comments.splice(commentIndex, 1);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.status(204).send();
});

app.post('/posts/:id/like', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');

    post.likes += 1;
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.json(post);
});

app.post('/posts/:id/unlike', (req, res) => {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) return res.status(404).send('Post not found');

    post.likes = Math.max(post.likes - 1, 0);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
    res.json(post);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
