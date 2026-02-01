const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbPath = path.join(__dirname, 'data', 'opspulse.db');
const db = new sqlite3.Database(dbPath);

const init = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      status TEXT NOT NULL,
      latency_ms INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )`);

    db.get('SELECT COUNT(*) as count FROM metrics', (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO metrics (service, status, latency_ms, created_at) VALUES (?,?,?,?)');
        const now = new Date().toISOString();
        stmt.run('auth-api', 'healthy', 82, now);
        stmt.run('billing-worker', 'degraded', 240, now);
        stmt.run('edge-cache', 'healthy', 45, now);
        stmt.finalize();
      }
    });
  });
};

init();

app.get('/api/metrics', (req, res) => {
  db.all('SELECT * FROM metrics ORDER BY id DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: 'db_error' });
    res.json(rows);
  });
});

app.post('/api/metrics', (req, res) => {
  const { service, status, latency_ms } = req.body;
  if (!service || !status || typeof latency_ms !== 'number') {
    return res.status(400).json({ error: 'invalid_payload' });
  }
  const created_at = new Date().toISOString();
  db.run(
    'INSERT INTO metrics (service, status, latency_ms, created_at) VALUES (?,?,?,?)',
    [service, status, latency_ms, created_at],
    function (err) {
      if (err) return res.status(500).json({ error: 'db_error' });
      res.status(201).json({ id: this.lastID, service, status, latency_ms, created_at });
    }
  );
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'opspulse-dashboard' });
});

app.listen(PORT, () => {
  console.log(`OpsPulse running on http://localhost:${PORT}`);
});
