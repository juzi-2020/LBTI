const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '').replace(/\/+$/, '') || '/';

  // POST /api/* - 保存结果
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { type, typeName, typeCategory, wasteLevel, innerDrama, coldness, extreme, conflict, answers } = body;
      if (!type || !typeName) return json({ error: '缺少参数' }, 400);
      const ip = request.headers.get('cf-connecting-ip') || '';
      const ua = request.headers.get('user-agent') || '';
      await env.DB.prepare(
        `INSERT INTO results (type, type_name, type_category, waste_level, inner_drama, coldness, extreme, conflict, answers, ip, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+8 hours'))`
      ).bind(type, typeName, typeCategory || '', wasteLevel || 1, innerDrama || 0, coldness || 0, extreme || 0, conflict || 0,
        answers ? JSON.stringify(answers) : null, ip, ua).run();
      return json({ success: true });
    } catch (err) { return json({ error: err.message }, 500); }
  }

  // GET /stats
  if (request.method === 'GET' && path === '/stats') {
    try {
      const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
      const today = (await env.DB.prepare("SELECT COUNT(*) as c FROM results WHERE date(created_at) = date('now')").first()).c;
      const typeDist = await env.DB.prepare('SELECT type, type_name, COUNT(*) as count FROM results GROUP BY type ORDER BY count DESC').all();
      const wasteDist = await env.DB.prepare('SELECT waste_level, COUNT(*) as count FROM results GROUP BY waste_level ORDER BY waste_level').all();
      const avgDrama = (await env.DB.prepare('SELECT AVG(inner_drama) as v FROM results').first())?.v || 0;
      const avgCold = (await env.DB.prepare('SELECT AVG(coldness) as v FROM results').first())?.v || 0;
      const latest = await env.DB.prepare('SELECT id, type, type_name, waste_level, inner_drama, coldness, created_at FROM results ORDER BY created_at DESC LIMIT 10').all();
      return json({ total, today, typeDist: typeDist.results, wasteDist: wasteDist.results, avgDrama: Math.round(avgDrama), avgCold: Math.round(avgCold), latest: latest.results });
    } catch (err) { return json({ error: err.message }, 500); }
  }

  // GET /results 或 /results/数字
  if (request.method === 'GET' && path.startsWith('/results')) {
    try {
      const parts = path.replace('/results', '').replace(/^\//, '').split('/').filter(Boolean);
      // 详情 /results/123
      if (parts.length === 1 && /^\d+$/.test(parts[0])) {
        const row = await env.DB.prepare('SELECT * FROM results WHERE id = ?').bind(parseInt(parts[0])).first();
        if (!row) return json({ error: '未找到' }, 404);
        if (row.answers) try { row.answers = JSON.parse(row.answers); } catch {}
        return json(row);
      }
      // 列表 /results
      const page = Math.max(1, parseInt(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;
      const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
      const rows = await env.DB.prepare('SELECT * FROM results ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
      return json({ total, page, limit, totalPages: Math.ceil(total / limit), data: rows.results });
    } catch (err) { return json({ error: err.message }, 500); }
  }

  return json({ error: 'Not Found' }, 404);
}
