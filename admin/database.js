const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'results.json');
const COUNTER_FILE = path.join(__dirname, 'data', 'counter.json');

function ensureDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function load() {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch { return []; }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getNextId() {
  ensureDir();
  let id = 1;
  try { id = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8')).nextId; } catch {}
  fs.writeFileSync(COUNTER_FILE, JSON.stringify({ nextId: id + 1 }), 'utf8');
  return id;
}

function now() {
  const d = new Date();
  d.setHours(d.getHours() + 8); // UTC+8
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = {
  insert(row) {
    const data = load();
    row.id = getNextId();
    row.created_at = now();
    data.push(row);
    save(data);
    return row.id;
  },

  count() {
    return load().length;
  },

  countToday() {
    const today = now().substring(0, 10);
    return load().filter(r => r.created_at.startsWith(today)).length;
  },

  all() {
    return load();
  },

  paginate(page = 1, limit = 20) {
    const data = load().reverse();
    const total = data.length;
    const start = (page - 1) * limit;
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: data.slice(start, start + limit)
    };
  },

  getById(id) {
    return load().find(r => r.id === parseInt(id)) || null;
  },

  typeDistribution() {
    const data = load();
    const map = {};
    data.forEach(r => {
      const key = r.type + '|' + (r.type_name || '');
      if (!map[key]) map[key] = { type: r.type, type_name: r.type_name, type_category: r.type_category || '', count: 0 };
      map[key].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  },

  wasteDistribution() {
    const data = load();
    const map = {};
    data.forEach(r => {
      const lv = r.waste_level || 1;
      if (!map[lv]) map[lv] = { waste_level: lv, count: 0 };
      map[lv].count++;
    });
    return Object.values(map).sort((a, b) => a.waste_level - b.waste_level);
  },

  avgDimension(dim) {
    const data = load();
    if (!data.length) return 0;
    const sum = data.reduce((s, r) => s + (r[dim] || 0), 0);
    return Math.round(sum / data.length);
  },

  latest(limit = 10) {
    return load().reverse().slice(0, limit);
  }
};
