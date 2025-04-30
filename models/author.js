// Require necessary libraries and global variables
const mongoose = require('mongoose');

// Import modules
const Book = require('./book');

// Create schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// Method to prevent author deletion if books are associated
authorSchema.pre('deleteOne', async function (next) {
    try {
        // Find the books for a given author
        const query = this.getFilter();
        const hasBook = await Book.exists({author: query._id});

        if (hasBook) {
            // If books are found for this author, pass along error message to prevent deletion
            next(new Error('This author still has books.'));
        } else {
            // If no books are found, pass along message to okay deletion
            next();
        }
    } catch (err) {
        // Upon error (ex. can't connect to database), pass along error message to prevent deletion
        next(err);
    }
});

// Export module
module.exports = mongoose.model('Author', authorSchema);
