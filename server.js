'use strict';

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const client = new pg.Client(process.env.DATABASE_URL);

app.get('/hello', renderHome);

function renderHome (request, response){
  response.render('pages/index');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`listening on port: ${PORT}`));
  });
