'use strict';

require('dotenv').config();

const express = require('express');
// const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// const client = new pg.Client(process.env.DATABASE_URL);

// Routes
app.get('/', renderHome);
app.get('/searches/new', renderNewSearch);
app.post('/searches', collectFormData);


// Constructor Functions
function Book(book){
  this.title = book.title;
  this.author = book.authors;
  this.description = book.description;
  this.isbn = book.isbn;
  this.bookshelf = book.bookshelf;
  if(book.imageLinks){
    this.image = book.imageLinks.thumbnail ? book.imageLinks.thumbnail : url('./styles/img/placeholder_img.png');
  }
}


// Callback functions
function renderHome (request, response){
  response.status(200).render('./pages/index');
}

function renderNewSearch (request, response) {
  response.status(200).render('./pages/searches/new');
}

function collectFormData (request, response) {
  let searchText = request.body.searchQuery;
  //   console.log(formData);
  let radioSelect = request.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${radioSelect}:${searchText}&maxResult=10`;

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { results: results }))
    .catch(error => {
      handleError(error, request, response);
    });
}

function handleError (error, request, response) {
    response.status(500).render('./pages/error');
}

// client.connect()
//   .then(() => {
app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
//   });
