const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    required: true,
    minlength: 2,
    maxlength: 20,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 60
  },
  createdAt: {
    type: Number,
    required: true
  },
  emailId: {
    type: String,
    trim: true,
    minlength: 2,
    required: true,
    unique: true,
    sparse: true
  },
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

UserSchema.methods.generateAuthToken = function() {
  const user = this;
  const access = 'Auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();
  let tokens = [...user.tokens];
  tokens = tokens.concat([{ access, token }]);
  user.tokens = tokens;
  return user.save().then(() => token);
}

UserSchema.methods.removeToken = function(token) {
  const user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
}

UserSchema.statics.changePassword = function(id, newPassword, oldPassword) {
  let User = this;
  return User.findById(id)
  .then((user) => {
    if(!user) return Promise.reject({ msg: 'User does not exist' });
    return new Promise((resolve, reject) => {
      bcrypt.compare(oldPassword, user.password, (err, res) => {
        if(res) {
          user.set({ password: newPassword });
          user.save()
            .then(() => resolve())
            .catch(() => reject({ msg:'unable to save' }))
        }
        else reject({ msg: 'oldPassword is not correct.' });
      });
    });
  });
}

UserSchema.statics.findByCredentials = function(userName, password) {
  const User = this;
  return User.findOne({ userName })
    .then((user) => {
      if(!user) return Promise.reject();
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if(res) resolve(user);
          else reject();
        });
      });
    });
}

UserSchema.statics.findByToken = function(token) {
  const User = this;
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e) {
    return Promise.reject('Unable to verify!');
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'Auth'
  });
}

UserSchema.pre('save', function(next) {
  let user = this;
  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
