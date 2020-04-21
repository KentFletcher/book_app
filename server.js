'use strict';

require('dotenv').config();

const express = require('express');
// const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// const client = new pg.Client(process.env.DATABASE_URL);

// Routes
app.get('/', renderHome);
app.get('/searches/new', renderNewSearch);
app.post('/searches', collectFormData);

// Callback functions
function renderHome (request, response){
  response.status(200).render('pages/index');
}

function renderNewSearch (request, response) {
  response.status(200).render('pages/searches/new');
}

function collectFormData (request, response) {
  let search = request.body;
  let searchText = search.searchQuery;
  //   console.log(formData);
  let radioSelect = search.search;
  let url = `https://www.googleapis.com/books/v1/volumes?q=+${radioSelect}:${searchText}&maxResult=10`;

  superagent.get(url)
    .then((results) => {
      console.log('books', results.body.items);
    });

  response.status(200).render('pages/searches/show');
}


//Constructor Functions
// function NewBook(book){

// }


// client.connect()
//   .then(() => {
app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
//   });
