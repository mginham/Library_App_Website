// Require necessary libraries and global variables
const express = require('express');
const router = express.Router();

// Root
router.get ('/', (req, res) => {
    res.render('index');
});

// Export module
module.exports = router;
