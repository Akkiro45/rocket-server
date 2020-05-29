const express = require('express');
const _ = require('lodash');

const Link = require('../models/link');
const { authenticate } = require('../middlewares/authenticate');
const scrapMetadata = require('../services/scrapMetadata');

const router = express.Router();

router.post('/add', authenticate, (req, res) => {
  let resBody = {};
  let error = {};
  const reqBody = _.pick(req.body, ['url', 'group', 'data', 'hide']);
  reqBody._id = req.user._id;
  scrapMetadata(reqBody)
    .then(data => {
      resBody.status = 'ok';
      resBody.data = data;
      return res.status(200).send(resBody);
    })
    .catch(e => {
      error.msg = 'Invalid link!';
      resBody.status = 'error';
      resBody.error = error;
      return res.status(400).send(resBody);
    });
});

router.delete('/remove/:id', authenticate, async (req, res) => {
  const resBody = {};
  const error = {};
  const id = req.params.id;
  try {
    const link = await Link.findOneAndRemove({ userId: req.user._id, _id: id });
    if(link) {
      resBody.status = 'ok';
      return res.status(200).send(resBody);
    } else {
      throw new Error('Error');
    }
  } catch(e) {
    resBody.status = 'error';
    error.msg = 'Unable to remove!';
    resBody.error = error;
    return res.status(400).send(resBody);
  }
});

router.get('/', authenticate, async (req, res) => {
  let resBody = {};
  let error = {};
  const pageNumber = parseInt(req.query.pageNumber);
  const pageSize = parseInt(req.query.pageSize);
  let links;
  try {
    if(pageSize === -1) {
      links = await Link.find({ userId: req.user._id }).sort({ createdAt: -1 });
    } else {
      links = await Link.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize);
    }
    if(links) {
      resBody.status = 'ok';
      resBody.data = links;
      return res.status(200).send(resBody);
    } else {
      error.msg = 'Not Found';
      resBody.status = 'error';
      resBody.error = error;
      return res.status(404).send(resBody);
    }
  } catch(e) {
    resBody.status = 'error';
    error.msg = 'something went wrong!';
    resBody.error = error;
    return res.status(400).send(resBody);
  }
});

router.patch('/edit', authenticate, async (req, res) => {
  let resBody = {};
  let error = {};
  try {
    const link = await Link.findById(req.body.id);
    if(!link) {
      throw new Error('Error!');
    }
    link[req.body.type] = req.body.value;
    await link.save();
    resBody.status = 'ok';
    return res.status(200).send(resBody);
  } catch(e) {
    error.msg = 'Not found!';
    resBody.error = error;
    resBody.status = 'error';
    return res.status(404).send(resBody);
  }
});

module.exports = router;
