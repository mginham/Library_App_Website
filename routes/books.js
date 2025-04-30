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
        res.redirect(`books/${newBook.id}`);
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

// Route - Edit selected book
router.get('/:id/edit', async (req, res) => {
    try {
        // Get book info
        const book = await Book.findById(req.params.id);

        // Display info on edit page
        renderEditPage(res, book);
    } catch (err) {
        // Redirect to homepage
        res.redirect('/');
    }
});

// Route - Update selected book
router.put('/:id', async (req, res) => {
    let book;

    try {
        // Find the book with the given ID
        book = await Book.findById(req.params.id);

        // Get updated book info from user input
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;

        // Only save an update cover if one is provided
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(book, req.body.cover);
        }

        // Save the updated book info to the database
        await book.save();

        // Upon success, redirect to updated book page
        res.redirect(`/books/${book.id}`);
    } catch (err) {
        if (book == null) {
            // If book is not found, redirect to homepage
            res.redirect('/');
        } else {
            // Upon error, if book exists, render the edit page again
            renderEditPage(res, book, true);
        }
    }
});

// Route - Delete selected book
router.delete('/:id', async (req, res) => {
    let book;

    try {
        // Find the book with the given ID
        book = await Book.findById(req.params.id);

        // Delete the book from the database
        await book.deleteOne({_id: req.params.id});

        // Upon success, redirect to the authors page
        res.redirect('/books');
    } catch (err) {
        // If book is not found, redirect to homepage
        if (book == null) {
            res.redirect('/');
        } else {
            // Upon error, if book exists, render that book's page again
            res.render('/books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            });
        }
    }
});


// Middleware

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError);
}

function saveCover(book, coverEncoded) {
    // Check if cover is valid
    if(coverEncoded == null || coverEncoded == '') return;

    // Check if cover + type is valid
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)) {
        // Get the cover properties
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        // Retrieve full authors list and book info
        const authors = await Author.find({});
        const params = {
            authors: authors,
            book: book
        }

        if(hasError) {
            if (form === 'new') {
                params.errorMessage = 'Error creating book';
            } else if (form ==='edit') {
                params.errorMessage = 'Error updating book';
            }
        }

        // Pass along full authors list and book info
        res.render(`books/${form}`, params);
    } catch (err) {
        // Redirect to books page
        res.redirect('/books');
    }
}


// Export module
module.exports = router;
