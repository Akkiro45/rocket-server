require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const _ = require('lodash');
const helmet = require('helmet');

const { mongoose } = require('./db/mongoose');
const userRoute = require('./routes/user');
const linkRoute = require('./routes/link');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json({limit: '50mb'}));
app.use(helmet());
app.use(cors());
app.enable('trust proxy');

// Routes
app.use(`/user`, userRoute);
app.use(`/link`, linkRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const {getMetadata} = require('page-metadata-parser');
// const domino = require('domino');
// const fetch = require('node-fetch');
//
// const f = async () => {
//   const url = 'https://yts.mx/movie/21-bridges-2019';
//   const response = await fetch(url);
//   const html = await response.text();
//   const doc = domino.createWindow(html).document;
//   const metadata = getMetadata(doc, url);
//   console.log(metadata)
// }
// f();

// const urlMetadata = require('url-metadata')
// urlMetadata('https://yts.mx/movie/21-bridges-2019').then(
//   function (metadata) { // success handler
//     console.log(metadata)
//   },
//   function (error) { // failure handler
//     console.log(error)
//   })
