const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;
client.connect(err => {
  if (err) throw err;
  db = client.db('test'); // Updated to use the 'test' database
  console.log('Connected to MongoDB');
});

app.use(cors());
app.use(express.json());

app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main.html'));
});

// Endpoint to fetch titles
app.get('/titles', async (req, res) => {
  try {
    const titles = await db.collection('titles').find().toArray();
    res.json(titles);
  } catch (err) {
    res.status(500).send('Error reading titles');
  }
});

// Endpoint to fetch presenters
app.get('/presenters', async (req, res) => {
  try {
    const presenters = await db.collection('presenters').find().toArray();
    res.json(presenters);
  } catch (err) {
    res.status(500).send('Error reading presenters');
  }
});

// Endpoint to add a new presenter
app.post('/add-presenter', async (req, res) => {
  try {
    await db.collection('presenters').insertOne({ name: req.body.name });
    res.send(req.body.name);
  } catch (err) {
    res.status(500).send('Error saving presenter');
  }
});

// Endpoint to add a new course title
app.post('/add-title', async (req, res) => {
  try {
    await db.collection('titles').insertOne({
      title: req.body.title,
      years_of_experience: Number(req.body.years_of_experience)
    });
    res.send(req.body.title);
  } catch (err) {
    res.status(500).send('Error saving title');
  }
});

// Endpoint to update courses
app.post('/update-courses', async (req, res) => {
  try {
    const bulkOps = req.body.map(course => ({
      updateOne: {
        filter: { _id: ObjectId(course._id) },
        update: { $set: course },
        upsert: true
      }
    }));
    await db.collection('courses').bulkWrite(bulkOps);
    res.send('Courses updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update courses');
  }
});

// Endpoint to update titles
app.post('/update-titles', async (req, res) => {
  try {
    const bulkOps = req.body.map(title => ({
      updateOne: {
        filter: { _id: ObjectId(title._id) },
        update: { $set: title },
        upsert: true
      }
    }));
    await db.collection('titles').bulkWrite(bulkOps);
    res.send('Titles updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update titles');
  }
});

// Endpoint to update presenters
app.post('/update-presenters', async (req, res) => {
  try {
    const bulkOps = req.body.map(presenter => ({
      updateOne: {
        filter: { _id: ObjectId(presenter._id) },
        update: { $set: presenter },
        upsert: true
      }
    }));
    await db.collection('presenters').bulkWrite(bulkOps);
    res.send('Presenters updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update presenters');
  }
});

// Endpoint to delete a presenter
app.post('/delete-presenter', async (req, res) => {
  try {
    await db.collection('presenters').deleteOne({ _id: ObjectId(req.body._id) });
    res.send('Presenter deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting presenter');
  }
});

// Endpoint to delete a course
app.post('/delete-course', async (req, res) => {
  try {
    await db.collection('courses').deleteOne({ _id: ObjectId(req.body._id) });
    res.send('Course deleted successfully');
  } catch (err) {
    res.status(500).send('Error deleting course');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/pages/main.html`);
});
