const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (your HTML, CSS, JS files)
app.use(express.static(path.join(__dirname)));

// Endpoint to save course data
app.post('/save', (req, res) => {
  const course = req.body;

  fs.readFile('courses.json', 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading courses.json:', err);
      return res.status(500).send('Error reading data');
    }

    let courses = [];
    try {
      courses = JSON.parse(data);
    } catch (parseErr) {
      console.error('Error parsing JSON data:', parseErr);
      return res.status(500).send('Error parsing data');
    }

    courses.push(course);

    fs.writeFile('courses.json', JSON.stringify(courses, null, 2), (err) => {
      if (err) {
        console.error('Error writing to courses.json:', err);
        return res.status(500).send('Error saving data');
      }
      res.status(200).send('Data saved');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
