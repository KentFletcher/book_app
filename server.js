'use strict';

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));


// Routes
app.get('/', renderHome);
app.get('/searches/new', renderNewSearch);
app.post('/searches', collectFormData);
app.post('/books', addToCollection);
app.get('/books/:id', getBookDetails);
app.put('/books/:id', updateBook);
app.get('*', (request, response) => response.status(404).render('./pages/error', {errorMessage: 'Page not found', errorCorrect: 'The path you took, leads only here.  Some would call this, "nowhere".'}));

// Constructor Function
function Book(book){
  this.title = book.title;
  this.author = book.authors;
  this.description = book.description;
  this.isbn = book.industryIdentifiers[0].identifier;
  this.bookshelf = book.bookshelf;
  if(book.imageLinks){
    this.image = book.imageLinks.thumbnail ? book.imageLinks.thumbnail : url('./styles/img/placeholder_img.png');
  }
}


// Callback functions
function renderHome (request, response){
  let sql = 'SELECT * FROM books;';

  client.query(sql)
    .then(results => {
      let resultsData = results.rows;
      let collectionCount = results.rows.length;
      response.status(200).render('./pages/index', {book: resultsData, count: collectionCount});
    }).catch(error => handleError(error, request, response));
}

function renderNewSearch (request, response) {
  response.status(200).render('./pages/searches/new');
}

function collectFormData (request, response) {
  let searchText = request.body.searchQuery;
  let radioSelect = request.body.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${radioSelect}:${searchText}&maxResult=10`;

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(book => response.render('pages/books/show', { book: book }))
    .catch(error => {
      handleError(error, request, response);
    });
}

function getBookDetails(request, response) {
  let id = request.params.id;
  let sql = 'SELECT * FROM books WHERE id=$1;';
  let safeValues = [id];

  client.query(sql, safeValues)
    .then(results => response.render('./pages/books/details', {book: results.rows}))
    .catch((err) => {
      console.log('Error showing book details', err);
      response.status(500).render('.pages/error', {errorMessage: 'Could not show book details', errorCorrect: 'Not sure what you did?'});
    });
}

function addToCollection (request, response) {
  let {title, author, description, isbn, bookshelf, image} = request.body;
  let sql =`INSERT INTO books (title, author, description, isbn, bookshelf, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
  let safeValues = [title, author, description, isbn, bookshelf, image];

  client.query(sql, safeValues)
    .then(results => {
      response.status(200).redirect(`./books/${results.rows[0].id}`);
    //   console.log(results.rows[0].id);
    }).catch(error =>handleError(error, request, response));
}

// function getDistinct() {
//     let sql = `SELECT DISTINCT bookshelf FROM books;`;
//     client.query(sql);
//         .then((results) => {
//             let shelfOption = result.rows;
//             response.status(200).render('./pages/')
//         })
// }

function updateBook (request, response){
  let id = request.params.id;
  let {title, author, description, isbn, bookshelf, image} = request.body;
  let sql = `UPDATE books SET title=$1, author=$2, description=$3, isbn=$4, bookshelf=$5, image=$6;`;
  let safeValues = [title, author, description, isbn, bookshelf, image];

  client.query(sql, safeValues)
    .then( () => {
      response.status(200).redirect(`./books/${id}`);
    }).catch(error =>handleError(error, request, response));

}


function handleError (error, request, response) {
  response.status(500).render('./pages/error');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
  }).catch((error, request, response) => {
    console.log('server not running');
    response.status(500).send(error);
  });
