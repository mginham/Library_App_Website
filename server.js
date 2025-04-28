// Check if running in production
if(process.env.NODE_ENV !== 'production') {
    // Load envionment variables in development env
    require('dotenv').config();
}

// Require necessary libraries and global variables
const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

// Import modules
const indexRouter = require('./routes/index');

// Configure express app
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use('/', indexRouter);

// Connect mongoose to the database
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

// Start a server and listen for incoming requests
const port = process.env.PORT || 3000; // Get the environmental port or take default value
app.listen(port, () => console.log(`Listening on port ${port}`));
