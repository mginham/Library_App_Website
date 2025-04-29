/* routes\books.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();

// Import modules
const Book = require('../models/book');
const Author = require('../models/author');

// Route - Get all books
router.get('/', async (req, res) => {
    res.send('All books');
});

// Route - Display new book form
router.get('/new', async (req, res) => {
    try {
        // Pass along full authors list and book info
        const authors = await Author.find({});
        const book = new Book();

        res.render('books/new', {
            authors: authors,
            book: book
        });
    } catch (err) {
        // Redirect to books page
        res.redirect('/books');
    }
});

// Route - Create a new book
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });
});

// Export module
module.exports = router;
