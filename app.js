const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


// Enable CORS for all routes
app.use(cors());

// Set up Multer to store files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'schedule/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json()); // Parse JSON bodies

// Serve static files from 'pages' and root directories
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'main.html'));
});

// Function to read JSON files
const readJSONFile = (relativePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, relativePath), 'utf-8', (err, data) => {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

// Function to write JSON files
const writeJSONFile = (relativePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, relativePath), JSON.stringify(data, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// Endpoint to fetch titles from 'titles.json'
app.get('/titles', async (req, res) => {
  try {
    const titles = await readJSONFile('database/titles.json');
    res.json(titles);
  } catch (err) {
    res.status(500).send('Error reading titles');
  }
});

// Endpoint to fetch presenters from 'presenters.json'
app.get('/presenters', async (req, res) => {
  try {
    const presenters = await readJSONFile('database/presenters.json');
    res.json(presenters);
  } catch (err) {
    res.status(500).send('Error reading presenters');
  }
});

// Endpoint to add a new course title to 'titles.json'
// app.post('/add-title', async (req, res) => {
//   try {
//     const titles = await readJSONFile('database/titles.json');
//     titles.push({ title: req.body.title, years_of_experience: req.body.years_of_experience });
//     await writeJSONFile('database/titles.json', titles);
//     res.send(req.body.title);
//   } catch (err) {
//     res.status(500).send('Error saving title');
//   }
// });

// Endpoint to add a new presenter to 'presenters.json'
app.post('/add-presenter', async (req, res) => {
  try {
    const presenters = await readJSONFile('database/presenters.json');
    presenters.push(req.body.name);
    await writeJSONFile('database/presenters.json', presenters);
    res.send(req.body.name);
  } catch (err) {
    res.status(500).send('保存 presenter 时出错');
  }
});

// Endpoint to add a new course title to 'titles.json'
app.post('/add-title', async (req, res) => {
  try {
    const titles = await readJSONFile('database/titles.json');
    titles.push({ title: req.body.title, years_of_experience: Number(req.body.years_of_experience) });
    await writeJSONFile('database/titles.json', titles);
    res.send(req.body.title);
  } catch (err) {
    res.status(500).send('Error saving title');
  }
});

// Endpoint to update courses in 'courses.json'
app.post('/update-courses', async (req, res) => {
  try {
    await writeJSONFile('database/courses.json', req.body);
    res.send('Courses updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update courses');
  }
});

// Endpoint to update titles in 'titles.json'
app.post('/update-titles', async (req, res) => {
  try {
    await writeJSONFile('database/titles.json', req.body);
    res.send('Titles updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update titles');
  }
});

// Endpoint to update presenters in 'presenters.json'
app.post('/update-presenters', async (req, res) => {
  try {
    await writeJSONFile('database/presenters.json', req.body);
    res.send('Presenters updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update presenters');
  }
});

// Endpoint to delete a course
app.post('/delete-course', async (req, res) => {
  try {
    const courses = await readJSONFile('database/courses.json');
    const courseIndex = req.body.index;

    if (courseIndex >= 0 && courseIndex < courses.length) {
      courses.splice(courseIndex, 1);
      await writeJSONFile('database/courses.json', courses);
      res.send('Course deleted successfully');
    } else {
      res.status(400).send('Invalid course index');
    }
  } catch (err) {
    res.status(500).send('Error deleting course');
  }
});

// Endpoint to save JSON files to 'schedule' directory
app.post('/save-json', (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).send('Invalid request: filename and content are required');
  }

  const filePath = path.join(__dirname, 'schedule', filename);

  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Error saving file');
    }
    res.send('File saved successfully');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/pages/main.html`);
});
