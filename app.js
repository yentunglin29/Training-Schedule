const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

// 設置 Multer 來保存文件
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'schedule/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.use(express.json());

// serve static files from the root and pages directories
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname)); // serve static files from root

const readJSONFile = (relativePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, relativePath), 'utf-8', (err, data) => {
      if (err) return reject(err);
      resolve(JSON.parse(data));
    });
  });
};

const writeJSONFile = (relativePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, relativePath), JSON.stringify(data, null, 2), (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

// show titles
app.get('/titles', async (req, res) => {
  try {
    const titles = await readJSONFile('database/titles.json');
    res.json(titles);
  } catch (err) {
    res.status(500).send('Error reading titles');
  }
});

// show presenters
app.get('/presenters', async (req, res) => {
  try {
    const presenters = await readJSONFile('database/presenters.json');
    res.json(presenters);
  } catch (err) {
    res.status(500).send('Error reading presenters');
  }
});

// add new course title
app.post('/add-course', async (req, res) => {
  try {
    const titles = await readJSONFile('database/titles.json');
    titles.push(req.body.title);
    await writeJSONFile('database/titles.json', titles);
    res.send(req.body.title);
  } catch (err) {
    res.status(500).send('Error saving title');
  }
});

// add new presenter
app.post('/add-presenter', async (req, res) => {
  try {
    const presenters = await readJSONFile('database/presenters.json');
    presenters.push(req.body.name);
    await writeJSONFile('database/presenters.json', presenters);
    res.send(req.body.name);
  } catch (err) {
    res.status(500).send('Error saving presenter');
  }
});

// save course info
app.post('/save', async (req, res) => {
  try {
    const courses = await readJSONFile('database/courses.json');
    courses.push(req.body);
    await writeJSONFile('database/courses.json', courses);
    res.send('Data saved');
  } catch (err) {
    res.status(500).send('Error saving data');
  }
});

// update courses
app.post('/update-courses', async (req, res) => {
  try {
    await writeJSONFile('database/courses.json', req.body);
    res.send('Courses updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update courses');
  }
});

// update titles
app.post('/update-titles', async (req, res) => {
  try {
    await writeJSONFile('database/titles.json', req.body);
    res.send('Titles updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update titles');
  }
});

// update presenters
app.post('/update-presenters', async (req, res) => {
  try {
    await writeJSONFile('database/presenters.json', req.body);
    res.send('Presenters updated successfully');
  } catch (err) {
    res.status(500).send('Failed to update presenters');
  }
});

// // 保存 JSON 文件的 API
// app.post('/save-json', (req, res) => {
//   const { filename, data } = req.body;
//   const filePath = path.join(__dirname, 'schedule', `${filename}.json`);
//   fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
//     if (err) {
//       return res.status(500).send('Error saving file');
//     }
//     res.send('File saved successfully');
//   });
// });

// 保存 JSON 文件的端点
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

// 保存 Excel 文件的 API
app.post('/save-excel', (req, res) => {
  const { filename, data } = req.body;
  const filePath = path.join(__dirname, 'schedule', `${filename}.xlsx`);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule');
  XLSX.writeFile(workbook, filePath);
  res.send('File saved successfully');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/pages/main.html`);
});
