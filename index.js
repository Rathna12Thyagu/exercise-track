const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const User = require('./models/user');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  await user.save();
  res.json({ username: user.username, _id: user._id });
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({}, 'username _id');
  res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { description, duration, date } = req.body;
  const user = await User.findById(req.params._id);

  if (!user) return res.status(404).send("User not found");

  const exercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date()
  };

  user.log.push(exercise);
  await user.save();

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date.toDateString(),
    duration: exercise.duration,
    description: exercise.description
  });
});

// 4. Get logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const user = await User.findById(req.params._id);

  if (!user) return res.status(404).send("User not found");

  let log = user.log;

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => e.date >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => e.date <= toDate);
  }
  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const formattedLog = log.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: formattedLog.length,
    log: formattedLog
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
