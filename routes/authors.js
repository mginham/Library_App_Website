/* routes\authors.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();

// Import modules
const Author = require('../models/author');
const Book = require('../models/book');

// Route - Get all authors
router.get('/', async (req, res) => {
    let searchOptions = {};

    if(req.query.name != null && req.query.name !== "") {
        // If user input provided, add parameters for the author search
        searchOptions.name = new RegExp(req.query.name, 'i');
    }

    try {
        // Return an array of all authors
        const authors = await Author.find(searchOptions);
        res.render('authors/index', {
            authors: authors,
            searchOptions: req.query
        });
    } catch (err) {
        // Redirect to homepage
        res.redirect('/');
    }
});

// Route - Display new author form
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()});
});

// Route - Create a new author
router.post('/', async (req, res) => {
    // Get author name from user input
    const author = new Author({
        name: req.body.name
    });

    try {
        // Save the new author info to the database
        const newAuthor = await author.save();

        // Upon success, redirect to newly created author page
        res.redirect(`authors/${newAuthor.id}`);
    } catch (err) {
        // Upon error, render the new page again, carry forward author info and display error message
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error in creating author'
        });
    }
});

// Route - Show selected author
router.get('/:id', async (req, res) => {
    try {
        // Get author info and associated books
        const author = await Author.findById(req.params.id);
        const books = await Book.find({author: author.id}).limit(6).exec();

        // Display info on author page
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        });
    } catch (err) {
        // Redirect to homepage
        res.redirect('/');
    }
});

// Route - Edit selected author
router.get('/:id/edit', async (req, res) => {

    try {
        // Find the author with the given ID
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {author: author});
    } catch (err) {
        // Upon error, redirect to the authors page
        res.redirect('/authors');
    }
});

// Route - Update selected author
router.put('/:id', async (req, res) => {
    let author;

    try {
        // Find the author with the given ID
        author = await Author.findById(req.params.id);

        // Update properties from user input
        author.name = req.body.name;

        // Save the updated author info to the database
        await author.save();

        // Upon success, redirect to newly created author page
        res.redirect(`/authors/${author.id}`);
    } catch (err) {
        if (author == null) {
            // If author is not found, redirect to homepage
            res.redirect('/');
        } else {
            // Upon error, if author exists, render the edit page again, carry forward author info and display error message
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error in updating author'
            });
        }
    }
});

// Route - Delete selected author
router.delete('/:id', async (req, res) => {
    let author;

    try {
        // Find the author with the given ID
        author = await Author.findById(req.params.id);

        // Delete the author from the database
        await author.deleteOne({_id: req.params.id});

        // Upon success, redirect to the authors page
        res.redirect('/authors');
    } catch (err) {
        // If author is not found, redirect to homepage
        if (author == null) {
            res.redirect('/');
        } else {
            // Upon error, if author exists, render that author's page again
            res.redirect(`/authors/${author.id}`);
        }
    }
});

// Export module
module.exports = router;
