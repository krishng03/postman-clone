const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const app = express();
const port = 5050;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

const db = new Database('history.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT NOT NULL,
    data TEXT,
    error TEXT,
    group_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/insert', (req, res) => {
  const { method, url, status, data, error, group_id, timestamp } = req.body;
  const insertData = db.prepare('INSERT INTO history (method, url, status, data, error, group_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertData.run(method, url, status, data, error, group_id, timestamp);
  res.send({ message: 'Data inserted successfully' });
});

app.get('/history', (req, res) => {
    try {
        const getAllHistory = db.prepare('SELECT * FROM history');
        const historyEntries = getAllHistory.all();
        res.json(historyEntries);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Failed to fetch history' });
    }
});

app.post('/insertGroups', (req, res) => {
    const { name, timestamp } = req.body;
    const insertGroup = db.prepare('INSERT INTO groups (name, timestamp) VALUES (?, ?)');
    insertGroup.run(name, timestamp);
    res.send({ message: 'Group inserted successfully' });
});

app.get('/getGroups', (req, res) => {
    try {
      const getAllGroups = db.prepare('SELECT * FROM groups');
      const groups = getAllGroups.all();
      res.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
