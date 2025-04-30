/* routes\books.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

// Import modules
const Book = require('../models/book');
const Author = require('../models/author');

// Route - Get all books
router.get('/', async (req, res) => {
    let query = Book.find();

    // Get title search parameters from user query
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }

    // Get published before search parameters from user query
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore);
    }

    // Get published after search parameters from user query
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter);
    }

    try {
        // Search for books that fit the given parameters
        const books = await query.exec();

        // Upon success, redirect to books index page
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch (err) {
        // Upon error, redirect to homepage
        res.redirect('/');
    }

});

// Route - Display new book form
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Route - Create a new book
router.post('/', async (req, res) => {
    // Get book info from user input
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description
    });

    // Save the book cover data
    saveCover(book, req.body.cover);

    try {
        // Save the new book info to the database
        const newBook = await book.save();

        // Upon success, redirect to newly created author page
        // res.redirect(`books/${newBook.id}`); // TODO: create book page and uncomment this line
        res.redirect('books'); // TODO: delete once book page is live
    } catch (err) {
        renderNewPage(res, book, true);
    }
});

// Route - Show selected book
router.get('/:id', async (req, res) => {
    try {
            // Get book info and associated author
            const book = await Book.findById(req.params.id).populate('author').exec();

            // Display info on book page
            res.render('books/show', {
                book: book
            });
        } catch (err) {
            // Redirect to homepage
            res.redirect('/');
        }
});

// Middleware
async function renderNewPage(res, book, hasError = false) {
    try {
        // Retrieve full authors list and book info
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }

        if(hasError) params.errorMessage = 'Error creating book';

        // Pass along full authors list and book info
        res.render('books/new', params);
    } catch (err) {
        // Redirect to books page
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded) {
    // Check if cover is valid
    if(coverEncoded == null) return;

    // Check if cover + type is valid
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)) {
        // Get the cover properties
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

// Export module
module.exports = router;
