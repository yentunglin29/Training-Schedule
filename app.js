const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001; // 使用未占用的端口

app.use(express.json());

// Serve static files from the root and pages directories
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use(express.static(__dirname)); // Serve script.js

// 辅助函数
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

// 提供现有课程标题
app.get('/titles', async (req, res) => {
  try {
    const titles = await readJSONFile('database/titles.json');
    res.json(titles);
  } catch (err) {
    res.status(500).send('Error reading titles');
  }
});

// 提供现有演讲者
app.get('/presenters', async (req, res) => {
  try {
    const presenters = await readJSONFile('database/presenters.json');
    res.json(presenters);
  } catch (err) {
    res.status(500).send('Error reading presenters');
  }
});

// 添加新课程标题
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

// 添加新演讲者
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

// 保存课程数据
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

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
