// CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function html(content, status = 200) {
  return new Response(content, {
    status,
    headers: { 'Content-Type': 'text/html;charset=utf-8' },
  });
}

async function handlePostResult(request, env) {
  try {
    const body = await request.json();
    const { type, typeName, typeCategory, wasteLevel, innerDrama, coldness, extreme, conflict, answers } = body;
    if (!type || !typeName) return json({ error: '缺少必要参数' }, 400);
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
    const ua = request.headers.get('user-agent') || '';

    await env.DB.prepare(
      `INSERT INTO results (type, type_name, type_category, waste_level, inner_drama, coldness, extreme, conflict, answers, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(type, typeName, typeCategory || '', wasteLevel || 1, innerDrama || 0, coldness || 0, extreme || 0, conflict || 0,
      answers ? JSON.stringify(answers) : null, ip, ua).run();

    return json({ success: true });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleStats(env) {
  try {
    const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
    const today = (await env.DB.prepare("SELECT COUNT(*) as c FROM results WHERE date(created_at) = date('now')").first()).c;
    const typeDist = await env.DB.prepare('SELECT type, type_name, type_category, COUNT(*) as count FROM results GROUP BY type ORDER BY count DESC').all();
    const wasteDist = await env.DB.prepare('SELECT waste_level, COUNT(*) as count FROM results GROUP BY waste_level ORDER BY waste_level').all();
    const avgDrama = (await env.DB.prepare('SELECT AVG(inner_drama) as v FROM results').first())?.v || 0;
    const avgCold = (await env.DB.prepare('SELECT AVG(coldness) as v FROM results').first())?.v || 0;
    const latest = await env.DB.prepare('SELECT id, type, type_name, waste_level, inner_drama, coldness, created_at FROM results ORDER BY created_at DESC LIMIT 10').all();

    return json({
      total, today,
      typeDist: typeDist.results, wasteDist: wasteDist.results,
      avgDrama: Math.round(avgDrama), avgCold: Math.round(avgCold),
      latest: latest.results
    });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleResults(request, env) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;
    const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
    const rows = await env.DB.prepare('SELECT * FROM results ORDER BY created_at DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
    return json({ total, page, limit, totalPages: Math.ceil(total / limit), data: rows.results });
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleResultDetail(id, env) {
  try {
    const row = await env.DB.prepare('SELECT * FROM results WHERE id = ?').bind(parseInt(id)).first();
    if (!row) return json({ error: '未找到' }, 404);
    if (row.answers) try { row.answers = JSON.parse(row.answers); } catch {}
    return json(row);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

async function handleAdmin(env) {
  const wasteNames = ['', '🟢 轻度废物', '🟡 中度废物', '🟠 重度废物', '🔴 极危废物', '💀 终极废料'];
  const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
  const today = (await env.DB.prepare("SELECT COUNT(*) as c FROM results WHERE date(created_at) = date('now')").first()).c;
  const typeDist = await env.DB.prepare('SELECT type, type_name, COUNT(*) as count FROM results GROUP BY type ORDER BY count DESC').all();
  const latest = await env.DB.prepare('SELECT id, type, type_name, waste_level, inner_drama, coldness, created_at FROM results ORDER BY created_at DESC LIMIT 15').all();

  let h = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LBTI 后台</title><style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif;background:#0e0a18;color:#d8d0f0;padding:30px}
    h1{font-size:22px;margin-bottom:20px}h2{font-size:16px;color:#7c5cfc;margin:24px 0 12px}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px}
    .card{background:#1a1430;border:1px solid #2f2848;border-radius:10px;padding:18px;text-align:center}
    .card .n{font-size:30px;font-weight:800;color:#7c5cfc}.card .l{font-size:12px;color:#8a7ea8;margin-top:4px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:8px 10px;background:#1a1430;border-bottom:2px solid #2f2848;color:#8a7ea8;font-size:11px}
    td{padding:8px 10px;border-bottom:1px solid #2f2848}.dim{color:#8a7ea8;font-size:12px}
    a{color:#7c5cfc;text-decoration:none}.bar{margin:8px 0}
    .bar-l{display:flex;justify-content:space-between;font-size:13px;margin-bottom:2px}
    .bar-t{height:16px;background:#231d3a;border-radius:6px;overflow:hidden}
    .bar-f{height:100%;background:linear-gradient(90deg,#7c5cfc,#9b7cfc);border-radius:6px}
    .pages{display:flex;gap:12px;justify-content:center;padding:12px 0;color:#8a7ea8;font-size:13px}
    .pages a{padding:6px 12px;border:1px solid #2f2848;border-radius:6px}
  `;

  if (total === 0) {
    return html(h + `</style></head><body><h1>LBTI 管理后台</h1><div class="cards"><div class="card"><div class="n">0</div><div class="l">总测试数</div></div><div class="card"><div class="n">0</div><div class="l">今日新增</div></div></div><p style="color:#8a7ea8;padding:30px;text-align:center">暂无数据，快去测一下吧</p></body></html>`);
  }

  h += `</style></head><body><h1>LBTI 管理后台</h1>
    <div class="cards"><div class="card"><div class="n">${total}</div><div class="l">总测试数</div></div><div class="card"><div class="n">${today}</div><div class="l">今日新增</div></div></div>
    <h2>人格分布</h2>`;

  typeDist.results.forEach(t => {
    const pct = Math.round(t.count / total * 100);
    h += `<div class="bar"><div class="bar-l"><span>${t.type} ${t.type_name}</span><span>${t.count}</span></div><div class="bar-t"><div class="bar-f" style="width:${pct}%"></div></div></div>`;
  });

  h += `<h2>最新测试</h2><table><thead><tr><th>ID</th><th>类型</th><th>等级</th><th>内心戏</th><th>冷淡值</th><th>时间</th></tr></thead><tbody>`;
  latest.results.forEach(r => {
    h += `<tr><td>#${r.id}</td><td>${r.type} ${r.type_name}</td><td>${wasteNames[r.waste_level]||''}</td><td>${r.inner_drama}%</td><td>${r.coldness}%</td><td class="dim">${r.created_at?.substring(0,16)||''}</td></tr>`;
  });
  h += `</tbody></table></body></html>`;

  return html(h);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API 路由
    if (path === '/api/results' && request.method === 'POST') return handlePostResult(request, env);
    if (path === '/api/stats') return handleStats(env);
    if (path === '/api/results') return handleResults(request, env);

    // 匹配 /api/results/数字
    const detailMatch = path.match(/^\/api\/results\/(\d+)$/);
    if (detailMatch) return handleResultDetail(detailMatch[1], env);

    // 管理后台
    if (path === '/admin' || path === '/admin/') return handleAdmin(env);

    // 根路径
    if (path === '/') return Response.redirect(url.origin + '/admin', 302);

    return json({ error: 'Not Found' }, 404);
  },
};
