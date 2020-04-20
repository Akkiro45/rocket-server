const express = require('express');
const _ = require('lodash');

const User = require('../models/user');
const { authenticate } = require('../middlewares/authenticate');

const router = express.Router();

// Signup
router.post('/signup', (req, res) => {
  let body = _.pick(req.body, ['userName', 'emailId', 'password']);
  let resBody = {};
  let error = {};
  body.createdAt = new Date().getTime();
  const user = new User(body);
  user.save()
    .then(() => {
      return user.generateAuthToken();
    })
      .then((token) => {
        resBody.status = 'ok';
        resBody.data = _.pick(user, ['userName', 'emailId', 'createdAt', '_id']);
        return res.set({
                  'Access-Control-Expose-Headers': 'x-auth',
                  'x-auth': token
                }).send(resBody);
      })
      .catch((e) => {
        resBody.status = 'error';
        error.msg = 'User already EXIST!';
        resBody.error = error;
        return res.status(400).send(resBody);
      });
});

// Signin
router.post('/signin', (req, res) => {
  const body = _.pick(req.body, ['userName', 'password']);
  let resBody = {};
  let error = {};
  User.findByCredentials(body.userName, body.password)
    .then(user => {
      resBody.status = 'ok';
      resBody.data = _.pick(user, ['userName', 'createdAt', 'emailId', '_id']);
      return user.generateAuthToken();
    })
      .then(token => {
        return res.set({
                  'Access-Control-Expose-Headers': 'x-auth',
                  'x-auth': token
                }).send(resBody);
      })
      .catch((e) => {
        resBody.status = 'error';
        error.msg = 'Invalid credentials!';
        resBody.error = error;
        return res.status(400).send(resBody);
      });
});

// Signout
router.delete('/signout', authenticate, (req, res) => {
  let resBody = {};
  req.user.removeToken(req.token)
    .then(() => {
      resBody.status = 'ok';
      return res.status(200).send(resBody);
    })
    .catch(e => {
      resBody.status = 'error';
      return res.status(400).send(resBody);
    });
});

module.exports = router;
