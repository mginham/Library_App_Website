/* models\author.js */

// Require necessary libraries and global variables
const mongoose = require('mongoose');

// Create schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// Export module
module.exports = mongoose.model('Author', authorSchema);
