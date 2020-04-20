const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to MongoDB Server!');
  })
  .catch(e => {
    console.log('Unable to Connect MongoDB Server! \n', e);
  });

module.exports = {
  mongoose
}

// mongodb://localhost:27017/RocketApp
// mongodb+srv://Akkiro:Rocket2020[1]@cluster1-zotfu.mongodb.net/Rocket?retryWrites=true&w=majority
