const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const AUTHORS_FILE = 'authors.json';
const BOOKS_FILE = 'books.json';

let authors = [];
let books = [];

try {
    const authorsData = fs.readFileSync(AUTHORS_FILE);
    authors = JSON.parse(authorsData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('authors.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

try {
    const booksData = fs.readFileSync(BOOKS_FILE);
    books = JSON.parse(booksData);
} catch (err) {
    if (err.code === 'ENOENT') {
        console.log('books.json file does not exist. Starting with an empty list.');
    } else {
        throw err;
    }
}

app.post('/authors', (req, res) => {
    const { name, biography } = req.body;
    if (!name || !biography) {
        return res.status(400).send('Name and biography are required');
    }

    const newAuthor = {
        id: authors.length + 1,
        name,
        biography
    };

    authors.push(newAuthor);
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2));
    res.status(201).json(newAuthor);
});

app.get('/authors', (req, res) => {
    res.json(authors);
});

app.get('/authors/:id', (req, res) => {
    const author = authors.find(a => a.id === parseInt(req.params.id));
    if (!author) return res.status(404).send('Author not found');
    res.json(author);
});

app.put('/authors/:id', (req, res) => {
    const author = authors.find(a => a.id === parseInt(req.params.id));
    if (!author) return res.status(404).send('Author not found');

    const { name, biography } = req.body;
    if (name) author.name = name;
    if (biography) author.biography = biography;

    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2));
    res.json(author);
});

app.delete('/authors/:id', (req, res) => {
    const authorIndex = authors.findIndex(a => a.id === parseInt(req.params.id));
    if (authorIndex === -1) return res.status(404).send('Author not found');

    authors.splice(authorIndex, 1);
    fs.writeFileSync(AUTHORS_FILE, JSON.stringify(authors, null, 2));
    res.status(204).send();
});

app.post('/books', (req, res) => {
    const { title, genre, authorIds } = req.body;
    if (!title || !genre || !Array.isArray(authorIds)) {
        return res.status(400).send('Title, genre, and author IDs are required');
    }

    const newBook = {
        id: books.length + 1,
        title,
        genre,
        authorIds
    };

    books.push(newBook);
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    res.status(201).json(newBook);
});

app.get('/books', (req, res) => {
    res.json(books);
});

app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
});

app.put('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).send('Book not found');

    const { title, genre, authorIds } = req.body;
    if (title) book.title = title;
    if (genre) book.genre = genre;
    if (authorIds) book.authorIds = authorIds;

    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    res.json(book);
});

app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex === -1) return res.status(404).send('Book not found');

    books.splice(bookIndex, 1);
    fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
    res.status(204).send();
});

app.get('/books/search', (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).send('Query parameter is required');

    const lowerQuery = query.toLowerCase();
    const results = books.filter(book =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.genre.toLowerCase().includes(lowerQuery) ||
        book.authorIds.some(authorId => {
            const author = authors.find(a => a.id === authorId);
            return author && author.name.toLowerCase().includes(lowerQuery);
        })
    );

    res.json(results);
});

app.get('/authors/:id/books', (req, res) => {
    const author = authors.find(a => a.id === parseInt(req.params.id));
    if (!author) return res.status(404).send('Author not found');

    const authorBooks = books.filter(book => book.authorIds.includes(author.id));
    res.json(authorBooks);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
