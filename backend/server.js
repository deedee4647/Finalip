const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;
const TABLE_NAME = 'Ratchaphol_6730202726';

app.use(cors());
app.use(express.json());

// ============================================================
// MySQL Database Configuration (Connecting to ip_std6730202726)
// ============================================================
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'std6730202726',
  password: process.env.DB_PASSWORD || 'aBz6*K3c',
  database: process.env.DB_NAME || 'ip_std6730202726',
  connectTimeout: 3000,
};

let dbPool = null;
let useDatabase = false;

// Default Mock Employees (used for In-Memory fallback & DB seeding)
const INITIAL_EMPLOYEES = [
  { id: '1', name: 'John Doe',       position: 'Software Engineer',    status: 'Active',   salary: 85000 },
  { id: '2', name: 'Jane Smith',     position: 'HR Manager',           status: 'Active',   salary: 55000 },
  { id: '3', name: 'Somchai Jaidee', position: 'Junior Developer',     status: 'On Leave', salary: 28000 },
  { id: '4', name: 'Somsri Dee',     position: 'Accountant',           status: 'Active',   salary: 42000 },
  { id: '5', name: 'Wichai Sabai',   position: 'Sales Executive',      status: 'Active',   salary: 32000 },
  { id: '6', name: 'Napa Daow',      position: 'Senior Architect',     status: 'Active',   salary: 95000 },
  { id: '7', name: 'Kitti Wittaya',  position: 'Intern',               status: 'On Leave', salary: 18000 },
];

let inMemoryEmployees = JSON.parse(JSON.stringify(INITIAL_EMPLOYEES));

// ============================================================
// Initialize Database & Table: Ratchaphol_6730202726
// ============================================================
async function initDatabase() {
  try {
    dbPool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
    });

    const conn = await dbPool.getConnection();

    // Create table Ratchaphol_6730202726 without touching products or users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        salary INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if table is empty, seed if needed
    const [rows] = await conn.query(`SELECT COUNT(*) as count FROM ${TABLE_NAME}`);
    if (rows[0].count === 0) {
      for (const emp of INITIAL_EMPLOYEES) {
        await conn.query(
          `INSERT INTO ${TABLE_NAME} (name, position, status, salary) VALUES (?, ?, ?, ?)`,
          [emp.name, emp.position, emp.status, emp.salary]
        );
      }
      console.log(`[DB] Seeded initial data into table ${TABLE_NAME}`);
    }

    conn.release();
    useDatabase = true;
    console.log(`[DB] Connected to MySQL successfully! Using table: ${TABLE_NAME} in DB: ${DB_CONFIG.database}`);
  } catch (err) {
    useDatabase = false;
    console.log(`[DB] MySQL connection not available (${err.message}). Using In-Memory array mode (Exam compliant).`);
  }
}

initDatabase();

// ============================================================
// 1D K-Means Clustering Algorithm (k=3)
// ============================================================
function kMeans1D(values, k, maxIter) {
  if (!values || values.length === 0) return [];
  k = k || 3;
  maxIter = maxIter || 100;

  const uniqueVals = values.filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  const actualK = Math.min(k, uniqueVals.length);

  let centroids = [];
  for (let i = 0; i < actualK; i++) {
    const idx = Math.floor((i * (uniqueVals.length - 1)) / Math.max(actualK - 1, 1));
    centroids.push(uniqueVals[idx]);
  }

  let assignments = new Array(values.length).fill(0);
  let prevAssignments = null;

  for (let iter = 0; iter < maxIter; iter++) {
    const newAssignments = values.map((v) => {
      let minDist = Infinity;
      let cluster = 0;
      centroids.forEach((c, ci) => {
        const dist = Math.abs(v - c);
        if (dist < minDist) { minDist = dist; cluster = ci; }
      });
      return cluster;
    });

    const converged = prevAssignments && newAssignments.every((a, i) => a === prevAssignments[i]);
    if (converged) break;
    prevAssignments = newAssignments;
    assignments = newAssignments;

    centroids = centroids.map((_, ci) => {
      const clusterVals = values.filter((_, vi) => assignments[vi] === ci);
      if (clusterVals.length === 0) return centroids[ci];
      return clusterVals.reduce((a, b) => a + b, 0) / clusterVals.length;
    });
  }

  const clusterMap = centroids.map((centroid, ci) => {
    const clusterVals = values.filter((_, vi) => assignments[vi] === ci);
    return { centroid: Math.round(centroid), count: clusterVals.length };
  });
  clusterMap.sort((a, b) => a.centroid - b.centroid);
  return clusterMap.map((c, i) => ({
    group: 'Tier ' + (i + 1),
    centroid: c.centroid,
    count: c.count,
  }));
}

// ============================================================
// Health Check
// ============================================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: `HR Manager Backend running on port ${PORT}`,
    database: useDatabase ? `MySQL (${DB_CONFIG.database}) -> Table: ${TABLE_NAME}` : 'In-Memory (Exam Mode)',
    table: TABLE_NAME,
  });
});

// ============================================================
// POST /api/login  (Authentication)
// ============================================================
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username and password' });
  }
  if (username.trim() === 'admin' && password.trim() === 'password123') {
    return res.json({ success: true, token: 'mock-jwt-token' });
  }
  return res.status(401).json({ success: false, message: 'Invalid username or password' });
});

// ============================================================
// GET /api/employees/salary-clusters  (K-Means Analytics)
// NOTE: MUST be declared BEFORE /api/employees/:id
// ============================================================
app.get('/api/employees/salary-clusters', async (req, res) => {
  try {
    let salaries = [];
    if (useDatabase && dbPool) {
      const [rows] = await dbPool.query(`SELECT salary FROM ${TABLE_NAME}`);
      salaries = rows.map((r) => Number(r.salary));
    } else {
      salaries = inMemoryEmployees.map((e) => Number(e.salary));
    }

    if (salaries.length === 0) {
      return res.status(400).json({ success: false, message: 'No employee data available for clustering' });
    }

    const clusters = kMeans1D(salaries, 3);
    return res.json({ success: true, clusters });
  } catch (err) {
    console.error('Clustering error:', err);
    return res.status(500).json({ success: false, message: 'Clustering analysis failed' });
  }
});

// ============================================================
// GET /api/employees  (Read all employees)
// ============================================================
app.get('/api/employees', async (req, res) => {
  try {
    if (useDatabase && dbPool) {
      const [rows] = await dbPool.query(`SELECT id, name, position, status, salary FROM ${TABLE_NAME} ORDER BY id ASC`);
      return res.json(rows.map(r => ({ ...r, id: String(r.id), salary: Number(r.salary) })));
    }
    return res.json(inMemoryEmployees);
  } catch (err) {
    console.error('Fetch employees error:', err);
    return res.json(inMemoryEmployees);
  }
});

// ============================================================
// POST /api/employees  (Create new employee)
// ============================================================
app.post('/api/employees', async (req, res) => {
  const { name, position, salary } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!position || !String(position).trim()) {
    return res.status(400).json({ success: false, message: 'Position is required' });
  }
  if (salary === undefined || salary === null || salary === '') {
    return res.status(400).json({ success: false, message: 'Salary is required' });
  }
  const salaryNum = Number(salary);
  if (isNaN(salaryNum) || salaryNum < 0) {
    return res.status(400).json({ success: false, message: 'Salary must be a valid number' });
  }

  const cleanName = String(name).trim();
  const cleanPos = String(position).trim();

  if (useDatabase && dbPool) {
    try {
      const [result] = await dbPool.query(
        `INSERT INTO ${TABLE_NAME} (name, position, status, salary) VALUES (?, ?, 'Active', ?)`,
        [cleanName, cleanPos, salaryNum]
      );
      const newEmp = {
        id: String(result.insertId),
        name: cleanName,
        position: cleanPos,
        status: 'Active',
        salary: salaryNum,
      };
      return res.status(201).json({ success: true, employee: newEmp });
    } catch (err) {
      console.error('DB Insert error:', err);
    }
  }

  // Fallback to in-memory
  const newEmp = {
    id: Date.now().toString(),
    name: cleanName,
    position: cleanPos,
    status: 'Active',
    salary: salaryNum,
  };
  inMemoryEmployees.push(newEmp);
  return res.status(201).json({ success: true, employee: newEmp });
});

// ============================================================
// PUT /api/employees/:id/status  (Toggle Active <-> On Leave)
// ============================================================
app.put('/api/employees/:id/status', async (req, res) => {
  const { id } = req.params;

  if (useDatabase && dbPool) {
    try {
      const [rows] = await dbPool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      const newStatus = rows[0].status === 'Active' ? 'On Leave' : 'Active';
      await dbPool.query(`UPDATE ${TABLE_NAME} SET status = ? WHERE id = ?`, [newStatus, id]);
      const updated = {
        id: String(rows[0].id),
        name: rows[0].name,
        position: rows[0].position,
        status: newStatus,
        salary: Number(rows[0].salary),
      };
      return res.json({ success: true, employee: updated });
    } catch (err) {
      console.error('DB Status update error:', err);
    }
  }

  // Fallback to in-memory
  const idx = inMemoryEmployees.findIndex(e => String(e.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  inMemoryEmployees[idx].status = inMemoryEmployees[idx].status === 'Active' ? 'On Leave' : 'Active';
  return res.json({ success: true, employee: inMemoryEmployees[idx] });
});

// ============================================================
// DELETE /api/employees/:id  (Delete employee)
// ============================================================
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;

  if (useDatabase && dbPool) {
    try {
      const [rows] = await dbPool.query(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      await dbPool.query(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
      const deleted = {
        id: String(rows[0].id),
        name: rows[0].name,
        position: rows[0].position,
        status: rows[0].status,
        salary: Number(rows[0].salary),
      };
      return res.json({ success: true, employee: deleted });
    } catch (err) {
      console.error('DB Delete error:', err);
    }
  }

  // Fallback to in-memory
  const idx = inMemoryEmployees.findIndex(e => String(e.id) === String(id));
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  const deleted = inMemoryEmployees.splice(idx, 1)[0];
  return res.json({ success: true, employee: deleted });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HR Manager Backend running on http://localhost:${PORT}`);
  console.log(`Target Table: ${TABLE_NAME}`);
});
