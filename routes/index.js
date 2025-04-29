/* routes\index.js */

// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();

// Import modules
const Book = require('../models/book');

// Root
router.get ('/', async (req, res) => {
    let books;

    try {
        // Get a limited number of the most recently added books
        books = await Book.find().sort({createdOn: 'desc'}).limit(10).exec();
    } catch (err) {
        // Upon error, default to an empty array
        books = [];
    }

    res.render('index', {books: books});
});

// Export module
module.exports = router;
