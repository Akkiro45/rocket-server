const express = require('express');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const User = require('../models/user');
const ResetPass = require('../models/resetpass');
const sendMail = require('../services/sendMail');

const router = express.Router();

router.post('/', async (req, res) => {
  const emailId = req.body.emailId;
  let resBody = {};
  let error = {};
  try {
    const user = await User.findOne({ emailId }).select({ _id: 1 });
    if(user) {
      const resetToken = jwt.sign({ userId: user._id, tokenId: new Date().getTime() }, process.env.JWT_SECRET).toString();
      const resetPass = new ResetPass({ userId: user._id });
      const saved = await resetPass.save();
      if(saved) {
        await sendMail(resetToken, emailId);
        resBody.status = 'ok';
        resBody.data = {
          userId: user._id
        }
        return res.send(resBody);
      }
    } else {
      resBody.status = 'error';
      error.msg = 'User not registered!';
      resBody.error = error;
      return res.status(404).send(resBody);
    }
  }
  catch(e) {
    error.msg = 'Something went Wrong!';
    resBody.status = 'error';
    resBody.error = error;
    return res.status(400).send(resBody);
  }
});

router.post('/check/:token', async (req, res) => {
  let error = {};
  let resBody = {};
  const token = req.params.token;
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    try {
      if(err) {
        error.msg = 'Invalid Token!';
        resBody.error = error;
        resBody.status = 'error';
        return res.status(400).send(resBody);
      }
      const resetPass = await ResetPass.findOne({ userId: decoded.userId });
      if(resetPass) {
        resBody.data = {
          userId: decoded.userId
        };
        resBody.status = 'ok';
        return res.status(200).send(resBody);
      } else {
        error.msg = 'Link Expired!';
        resBody.error = error;
        resBody.status = 'error';
        return res.status(404).send(resBody);
      }
    } catch(e) {
      error.msg = 'Something went Wrong!';
      resBody.status = 'error';
      resBody.error = error;
      return res.status(400).send(resBody);
    }
  });
});

router.patch('/reset', async (req, res) => {
  const body = _.pick(req.body, ['token', 'password', 'userId']);
  let resBody = {};
  let error = {};
  jwt.verify(body.token, process.env.JWT_SECRET, async (err, decoded) => {
    try {
      if(err) {
        error.msg = 'Invalid Token!';
        resBody.error = error;
        resBody.status = 'error';
        return res.status(400).send(resBody);
      }
      else {
        if(body.userId !== decoded.userId) {
          error.msg = 'Invalid Token!';
          resBody.error = error;
          resBody.status = 'error';
          return res.status(400).send(resBody);
        } else {
          const resetPass = await ResetPass.findOne({ userId: decoded.userId });
          if(resetPass) {
            const user = await User.findById(decoded.userId);
            user.set({ password: body.password, tokens: [] });
            const saved = await user.save();
            if(saved) {
              const rp = await ResetPass.remove({ userId: decoded.userId });
              if(rp) {
                resBody.status = 'ok';
                return res.send(resBody);
              }
            }
          } else {
            error.msg = 'Link Expired!';
            resBody.error = error;
            resBody.status = 'error';
            return res.status(404).send(resBody);
          }
        }
      }
    } catch(e) {
      error.msg = 'Something went Wrong!';
      resBody.status = 'error';
      resBody.error = error;
      return res.status(400).send(resBody);
    }
  });
});

module.exports = router;
