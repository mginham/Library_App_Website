/* routes\books.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import modules
const Book = require('../models/book');
const Author = require('../models/author');

// Configure multer
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
});

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
router.post('/', upload.single('cover'), async (req, res) => {
    // Get book info from user input
    const fileName = req.file != null ? req.file.filename : null; // If cover image name is not provided, default to null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    });

    try {
        // Save the new book info to the database
        const newBook = await book.save();

        // Upon success, redirect to newly created author page
        // res.redirect(`books/${newBook.id}`); // TODO: create book page and uncomment this line
        res.redirect('books'); // TODO: delete once book page is live
    } catch (err) {
        // Upon error, if book cover was uploaded, remove cover image name
        if(book.coverImageName != null) {
            removeBookCover(book.coverImageName);
        }

        renderNewPage(res, book, true);
    }
});

// Middleware
function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.err(err);
    });
}

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

// Export module
module.exports = router;
