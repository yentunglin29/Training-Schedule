const express = require('express');
const path = require('path');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let db;

client.connect()
  .then(() => {
    db = client.db('official'); // Use the 'official' database
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

// Middleware to check DB connection
app.use((req, res, next) => {
  if (!db) {
    return res.status(503).send('Database connection not established');
  }
  req.db = db;
  next();
});

app.use('/pages', express.static(path.join(__dirname, '..', 'pages')));
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'main.html'));
});

const withExtendedTimeout = (promise, timeout = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout)
    )
  ]);
};

// Endpoint to fetch titles
app.get('/api/titles', async (req, res) => {
  try {
    const titles = await withExtendedTimeout(
      db.collection('titles').find().toArray(),
      5000
    );
    res.json(titles);
  } catch (err) {
    console.error('Error reading titles:', err);
    res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }
});

// Endpoint to fetch courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await withExtendedTimeout(
      db.collection('courses').find().toArray(),
      5000
    );
    res.json(courses);
  } catch (err) {
    console.error('Error reading courses:', err);
    res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }
});

// New endpoint to fetch a course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await withExtendedTimeout(
      db.collection('courses').findOne({ _id: new ObjectId(courseId) }),
      5000
    );
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error('Error reading course:', err);
    res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }
});

// Endpoint to fetch presenters
app.get('/api/presenters', async (req, res) => {
  try {
    const presenters = await withExtendedTimeout(
      db.collection('presenters').find().toArray(),
      5000
    );
    res.json(presenters);
  } catch (err) {
    console.error('Error reading presenters:', err);
    res.status(503).json({ error: 'Service temporarily unavailable. Please try again later.' });
  }
});

// Endpoint to add a new presenter
app.post('/add-presenter', async (req, res) => {
  try {
    await db.collection('presenters').insertOne({ name: req.body.name });
    res.send(req.body.name);
  } catch (err) {
    console.error('Error saving presenter:', err);
    res.status(500).send('Error saving presenter');
  }
});

// Endpoint to fetch a title by ID
app.get('/get-title', async (req, res) => {
  try {
    const titleId = req.query.id;
    const title = await db.collection('titles').findOne({ _id: new ObjectId(titleId) });
    if (!title) {
      return res.status(404).json({ error: 'Title not found' });
    }
    res.json(title);
  } catch (err) {
    console.error('Error fetching title:', err);
    res.status(500).json({ error: 'Failed to fetch title' });
  }
});

// Endpoint to add a new course title
app.post('/add-title', async (req, res) => {
  try {
    await db.collection('titles').insertOne({
      title: req.body.title,
      years_of_experience: Number(req.body.years_of_experience),
      color: req.body.color
    });
    res.send(req.body.title);
  } catch (err) {
    console.error('Error saving title:', err);
    res.status(500).send('Error saving title');
  }
});

// Endpoint to add a new course
app.post('/add-course', async (req, res) => {
  try {
    const newCourse = req.body;
    const presenterIds = newCourse.presenter;
    
    // 使用 new 關鍵字來實例化 ObjectId
    const presenters = await db.collection('presenters').find({ 
      _id: { $in: presenterIds.map(id => new ObjectId(id)) } 
    }).toArray();
    
    const presenterNames = presenters.map(p => p.name);
    newCourse.presenter = presenterNames;
    
    await db.collection('courses').insertOne(newCourse);
    res.send('Course added successfully');
  } catch (err) {
    console.error('Failed to add course:', err);
    res.status(500).send('Failed to add course');
  }
});

// Endpoint to update courses
app.post('/update-course', async (req, res) => {
  try {
    const bulkOps = req.body.map(course => {
      const { _id, presenter, ...updateFields } = course;
      
      // Fetch presenter IDs using their names
      const presenterIds = presenter.map(name => {
        const p = db.collection('presenters').findOne({ name });
        return p._id;
      });

      return {
        updateOne: {
          filter: { _id: ObjectId.createFromHexString(course._id) },
          update: { $set: { ...updateFields, presenter: presenterIds } },
          upsert: true
        }
      };
    });
    await db.collection('courses').bulkWrite(bulkOps);
    res.send('Courses updated successfully');
  } catch (err) {
    console.error('Failed to update courses:', err);
    res.status(500).send('Failed to update courses');
  }
});

// Endpoint to update titles
app.post('/update-title', async (req, res) => {
  try {
    const bulkOps = req.body.map(title => {
      const { _id, ...updateFields } = title;
      return {
        updateOne: {
          filter: { _id: ObjectId.createFromHexString(title._id) },
          update: { $set: updateFields },
          upsert: true
        }
      };
    });
    await db.collection('titles').bulkWrite(bulkOps);
    res.json({ message: 'Titles updated successfully' });
  } catch (err) {
    console.error('Failed to update titles:', err);
    res.status(500).json({ error: 'Failed to update titles' });
  }
});

// Endpoint to update course title and related courses
app.put('/update-course-title', async (req, res) => {
  const { oldTitle, newTitle } = req.body;

  if (!oldTitle || !newTitle) {
    return res.status(400).json({ error: 'Old title and new title are required.' });
  }

  try {
    // Update the course title in the titles collection
    await db.collection('titles').updateOne(
      { title: oldTitle },
      { $set: { title: newTitle } }
    );

    // Update the courseTitle in all related courses
    await db.collection('courses').updateMany(
      { title: oldTitle },
      { $set: { title: newTitle } }
    );

    res.json({ message: 'Course title and related courses updated successfully.' });
  } catch (err) {
    console.error('Failed to update course title and related courses:', err);
    res.status(500).json({ error: 'Failed to update course title and related courses.' });
  }
});

// Endpoint to update presenters
app.post('/update-presenter', async (req, res) => {
  try {
    const bulkOps = req.body.map(presenter => ({
      updateOne: {
        filter: { _id: ObjectId.createFromHexString(presenter._id) },
        update: { $set: { name: presenter.name } },
        upsert: true
      }
    }));

    await db.collection('presenters').bulkWrite(bulkOps);

    // Update the presenter's name in all related courses
    const presenterNames = req.body.map(presenter => presenter.name);
    for (let i = 0; i < presenterNames.length; i++) {
      const oldName = req.body[i].oldName;
      const newName = presenterNames[i];
      await db.collection('courses').updateMany(
        { presenter: oldName },
        { $set: { "presenter.$[elem]": newName } },
        { arrayFilters: [{ "elem": oldName }] }
      );
    }

    res.send('Presenters and related courses updated successfully');
  } catch (err) {
    console.error('Failed to update presenters:', err);
    res.status(500).send('Failed to update presenters');
  }
});

// Endpoint to delete a presenter
app.post('/delete-presenter', async (req, res) => {
  try {
    await db.collection('presenters').deleteOne({ _id: ObjectId.createFromHexString(req.body._id) });
    res.send('Presenter deleted successfully');
  } catch (err) {
    console.error('Error deleting presenter:', err);
    res.status(500).send('Error deleting presenter');
  }
});

app.post('/delete-title', async (req, res) => {
  try {
    const titleId = ObjectId.createFromHexString(req.body._id);
    const titleDocument = await db.collection('titles').findOne({ _id: titleId });

    if (!titleDocument) {
      return res.status(404).send('Title not found');
    }

    const titleName = titleDocument.title;

    // Delete the title
    await db.collection('titles').deleteOne({ _id: titleId });

    // Delete all related courses
    await db.collection('courses').deleteMany({ title: titleName });

    res.send('Title and related courses deleted successfully');
  } catch (err) {
    console.error('Error deleting title and related courses:', err);
    res.status(500).send('Error deleting title and related courses');
  }
});

// Endpoint to delete a course
app.post('/delete-course', async (req, res) => {
  try {
    await db.collection('courses').deleteOne({ _id: ObjectId.createFromHexString(req.body._id) });
    res.send('Course deleted successfully');
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).send('Error deleting course');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
