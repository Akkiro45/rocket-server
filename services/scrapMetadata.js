const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');
const fetch = require('isomorphic-fetch');

const Link = require('../models/link');

module.exports = (reqBody) => {
  return new Promise(async (resolve, reject) => {
    try {
      let body = {};
      const response = await fetch(reqBody.url);
      const html = await response.text();
      const doc = domino.createWindow(html).document;
      const metadata = getMetadata(doc, reqBody.url);
      if(metadata) {
        body = {
          title: metadata.title,
          description: metadata.description,
          image: metadata.image,
          logo: metadata.icon
        }
      }
      body.userId = reqBody._id;
      body.url = reqBody.url;
      body.createdAt = new Date().getTime();
      body.hide = reqBody.hide;
      if(reqBody.group) {
        body.group = reqBody.group
      }
      const link = new Link(body);
      const savedData = await link.save();
      resolve(savedData);
    } catch(error) {
      reject(error);
    }
  });
}
