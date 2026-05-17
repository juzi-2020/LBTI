const express = require('express');
const router = express.Router();
const db = require('../database');

router.post('/results', (req, res) => {
  try {
    const { type, typeName, typeCategory, wasteLevel, innerDrama, coldness, extreme, conflict, answers } = req.body;
    if (!type || !typeName) return res.status(400).json({ error: '缺少必要参数' });

    const id = db.insert({
      type, type_name: typeName, type_category: typeCategory || '', waste_level: wasteLevel || 1,
      inner_drama: innerDrama || 0, coldness: coldness || 0, extreme: extreme || 0, conflict: conflict || 0,
      answers: answers ? JSON.stringify(answers) : null,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      user_agent: req.headers['user-agent'] || ''
    });

    res.json({ success: true, id });
  } catch (err) {
    console.error('保存失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/stats', (req, res) => {
  try {
    res.json({
      total: db.count(),
      today: db.countToday(),
      typeDist: db.typeDistribution(),
      wasteDist: db.wasteDistribution(),
      avgDrama: db.avgDimension('inner_drama'),
      avgCold: db.avgDimension('coldness'),
      latest: db.latest(10)
    });
  } catch (err) {
    console.error('统计失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/results', (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    res.json(db.paginate(page, limit));
  } catch (err) {
    console.error('获取列表失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/results/:id', (req, res) => {
  try {
    const row = db.getById(req.params.id);
    if (!row) return res.status(404).json({ error: '未找到' });
    if (row.answers && typeof row.answers === 'string') row.answers = JSON.parse(row.answers);
    res.json(row);
  } catch (err) {
    console.error('获取详情失败:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

module.exports = router;
