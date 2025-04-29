/* routes\authors.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();

// Import modules
const Author = require('../models/author');

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
        // res.redirect(`authors/${newAuthor.id}`); // TODO: create author page and uncomment this line
        res.redirect('authors'); // TODO: delete once author page is live

    } catch (err) {
        // Upon error, render the new page again, carry forward author info and display error message
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error in creating author'
        });
    }
});

// Export module
module.exports = router;
