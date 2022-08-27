
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config({path: __dirname + '/.env'});


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//set up mongoose connection
const uri = process.env.ATLAS_URI;
// useUnifiedTopology, useNewUrlParser, useCreateIndex
// all default to true in mongoose > 6.0
mongoose.connect(uri);
const connection = mongoose.connection;

//print out message on successful connection to database
connection.once('open', () => {
    console.log('MongoDB database connection established successfully!');
});

// const exerciseRouter = require('./routes/exercises');
const usersRouter = require('./routes/users');

// app.use('/exercises', exerciseRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})