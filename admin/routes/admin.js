const express = require('express');
const router = express.Router();
const db = require('../database');

const wasteNames = ['', '🟢 轻度废物', '🟡 中度废物', '🟠 重度废物', '🔴 极危废物', '💀 终极废料'];

router.get('/', (req, res) => {
  try {
    res.render('dashboard', {
      total: db.count(),
      today: db.countToday(),
      typeDist: db.typeDistribution(),
      wasteDist: db.wasteDistribution(),
      wasteNames,
      avgDrama: db.avgDimension('inner_drama'),
      avgCold: db.avgDimension('coldness'),
      latest: db.latest(20)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

router.get('/results', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 30;
    const result = db.paginate(page, limit);
    res.render('results', {
      rows: result.data, total: result.total, page, totalPages: result.totalPages, wasteNames
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

router.get('/results/:id', (req, res) => {
  try {
    const row = db.getById(req.params.id);
    if (!row) return res.status(404).send('未找到');
    if (row.answers && typeof row.answers === 'string') row.answers = JSON.parse(row.answers);
    res.render('detail', { row, wasteName: wasteNames[row.waste_level] || '' });
  } catch (err) {
    console.error(err);
    res.status(500).send('服务器错误');
  }
});

module.exports = router;
