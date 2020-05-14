const express = require('express');
const _ = require('lodash');
const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');
const fetch = require('isomorphic-fetch');

const Link = require('../models/link');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

router.post('/add', authenticate, async (req, res) => {
  let resBody = {};
  let error = {};
  const reqBody = _.pick(req.body, ['url', 'group', 'data']);
  try {
    if(reqBody.url) {
      let body;
      if(reqBody.data) {
        body = {
          ...reqBody.data,
          userId: req.user._id,
          // url: reqBody.url,
          // title: metadata.title,
          // description: metadata.description,
          // image: metadata.image,
          // logo: metadata.icon,
          createdAt: new Date().getTime()
        }
      } else {
        const response = await fetch(reqBody.url);
        const html = await response.text();
        const doc = domino.createWindow(html).document;
        const metadata = getMetadata(doc, reqBody.url);
        if(!metadata) {
          throw new Error('Error');
        }
        body = {
          userId: req.user._id,
          url: reqBody.url,
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          logo: metadata.icon,
          createdAt: new Date().getTime()
        }
      }
      if(reqBody.group) {
        body.group = reqBody.group
      }
      const link = new Link(body);
      const savedData = await link.save();
      resBody.status = 'ok';
      resBody.data = savedData;
      return res.status(200).send(resBody);
    } else {
      throw new Error('Error');
    }
  } catch(e) {
    error.msg = 'Invalid link!';
    resBody.status = 'error';
    resBody.error = error;
    return res.status(400).send(resBody);
  }
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

module.exports = router;
