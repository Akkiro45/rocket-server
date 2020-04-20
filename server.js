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

// Routes
app.use(`/user`, userRoute);
app.use(`/link`, linkRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// const urlMetadata = require('url-metadata')
// urlMetadata('https://medium.com/@balghazi/deploying-react-node-js-application-to-amazon-ec2-instance-a89140ab6aab').then(
//   function (metadata) { // success handler
//     console.log(metadata)
//   },
//   function (error) { // failure handler
//     console.log(error)
//   })
