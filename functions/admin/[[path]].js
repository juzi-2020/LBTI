const wasteNames = ['', '🟢 轻度废物', '🟡 中度废物', '🟠 重度废物', '🔴 极危废物', '💀 终极废料'];
const ipCache = new Map();

async function locateIP(ip) {
  if (!ip || ip === '-' || ip.startsWith('192.168') || ip.startsWith('10.') || ip === '127.0.0.1' || ip === '::1') return '本地';
  if (ipCache.has(ip)) return ipCache.get(ip);
  try {
    const res = await fetch('http://ip-api.com/json/' + encodeURIComponent(ip) + '?lang=zh-CN&fields=country,regionName,city,isp', { signal: AbortSignal.timeout(3000) });
    const d = await res.json();
    const loc = d.country && d.country !== '-' ? [d.country, d.regionName, d.city].filter(Boolean).join(' ') : '未知';
    ipCache.set(ip, loc);
    return loc;
  } catch { ipCache.set(ip, '未知'); return '未知'; }
}

const CSS = `<style>
*{margin:0;padding:0;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:#2f2848 #0e0a18}
body{font-family:system-ui,sans-serif;background:#0e0a18;color:#d8d0f0;min-height:100vh}

/* ===== Layout ===== */
.ctx{display:flex;min-height:100vh}
.sb{width:200px;background:#120e20;border-right:1px solid #2f2848;padding:24px 0;display:flex;flex-direction:column;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto}
.sb .lg{font-size:20px;font-weight:800;text-align:center;padding:0 20px 20px;color:#7c5cfc;letter-spacing:2px}
.sb .lg span{font-size:11px;color:#5a5070;font-weight:400;display:block;letter-spacing:0;margin-top:2px}
.sb a{display:flex;align-items:center;gap:8px;padding:10px 20px;color:#8a7ea8;font-size:13px;text-decoration:none;transition:.1s;border-right:2px solid transparent}
.sb a:hover{color:#d8d0f0;background:rgba(124,92,252,.06)}
.sb a.act{color:#7c5cfc;background:rgba(124,92,252,.1);border-right-color:#7c5cfc;font-weight:600}
.sb .sp{flex:1}
.sb .ft{font-size:10px;color:#3f3860;padding:10px 20px;text-align:center}
.mn{flex:1;padding:28px 32px;max-width:1100px}

/* ===== Header ===== */
h1{font-size:20px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
h1 .sub{font-size:12px;font-weight:400;color:#8a7ea8}
h2{font-size:14px;font-weight:600;color:#7c5cfc;margin:18px 0 8px}
.pg-desc{font-size:12px;color:#5a5070;margin-bottom:14px}

/* ===== Stat Cards ===== */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:14px}
.card{background:#1a1430;border:1px solid #2f2848;border-radius:8px;padding:14px 12px;text-align:center}
.card .n{font-size:26px;font-weight:800;color:#7c5cfc;line-height:1.2}
.card .l{font-size:10px;color:#8a7ea8;margin-top:2px;letter-spacing:.5px;text-transform:uppercase}
.card .s{font-size:12px;color:#5a5070;margin-top:2px}

/* ===== Tables ===== */
.tb-wrap{overflow-x:auto;border:1px solid #2f2848;border-radius:8px;background:#120e20}
table{width:100%;border-collapse:collapse;font-size:12px}
th{text-align:left;padding:8px 10px;border-bottom:1px solid #2f2848;color:#8a7ea8;font-size:10px;letter-spacing:1px;white-space:nowrap;cursor:pointer;user-select:none;background:#1a1430}
th:hover{color:#d8d0f0}
td{padding:8px 10px;border-bottom:1px solid #231d3a;vertical-align:top;font-size:12px}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(124,92,252,.04)}

/* ===== Typography ===== */
.dim{color:#8a7ea8;font-size:11px}
.mono{font-family:'Consolas','Courier New',monospace;font-size:11px}
a{color:#7c5cfc;text-decoration:none}a:hover{text-decoration:underline}

/* ===== Buttons ===== */
.btn{padding:5px 12px;border-radius:5px;border:1px solid #7c5cfc;background:rgba(124,92,252,.08);color:#7c5cfc;font-size:11px;cursor:pointer;font-family:inherit;transition:.1s;display:inline-flex;align-items:center;gap:4px}
.btn:hover{background:rgba(124,92,252,.18)}
.btn-sm{padding:3px 7px;font-size:10px}
.btn-del{color:#e84a6e;border-color:rgba(232,74,110,.25);background:rgba(232,74,110,.06)}
.btn-del:hover{background:rgba(232,74,110,.15)}

/* ===== Bars ===== */
.bar{margin:5px 0}.bar-l{display:flex;justify-content:space-between;font-size:11px;margin-bottom:1px;color:#8a7ea8}
.bar-t{height:10px;background:#231d3a;border-radius:4px;overflow:hidden}
.bar-f{height:100%;background:linear-gradient(90deg,#7c5cfc,#9b7cfc);border-radius:4px;transition:width .6s ease}
.bar-f.g{background:linear-gradient(90deg,#4caf50,#6fbf73)}.bar-f.o{background:linear-gradient(90deg,#f5a623,#f7b731)}.bar-f.r{background:linear-gradient(90deg,#e84a6e,#f06a7e)}

/* ===== Box ===== */
.bx{background:#120e20;border:1px solid #2f2848;border-radius:8px;padding:14px;margin-bottom:12px;overflow-x:auto}
.bx h3{font-size:12px;color:#7c5cfc;margin-bottom:8px;font-weight:600}
.bx-empty{padding:24px;text-align:center;color:#5a5070;font-size:13px}

/* ===== Filters ===== */
.fl{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;align-items:center}
.fl input,.fl select{padding:5px 8px;border-radius:5px;border:1px solid #2f2848;background:#1a1430;color:#d8d0f0;font-size:12px;font-family:inherit}
.fl input::placeholder{color:#5a5070}
.fl select option{background:#1a1430}

/* ===== Pagination ===== */
.pg{display:flex;gap:4px;align-items:center;justify-content:center;padding:12px 0 2px;font-size:12px}
.pg a,.pg span{padding:4px 10px;border-radius:4px;font-size:11px}
.pg a{border:1px solid #2f2848;background:#1a1430;color:#7c5cfc}
.pg a:hover{background:rgba(124,92,252,.1);border-color:#7c5cfc;text-decoration:none}
.pg .cur{color:#5a5070}

/* ===== Comparison ===== */
.cmp{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.cmp-it{flex:1;min-width:140px;background:#120e20;border:1px solid #2f2848;border-radius:8px;padding:12px}
.cmp-it .ct{font-size:10px;color:#8a7ea8;margin-bottom:4px}
.cmp-it .cv{font-size:20px;font-weight:700;color:#d8d0f0}
.cmp-it .cb{height:3px;border-radius:2px;margin-top:4px}
.cmp-it .cb.c1{background:linear-gradient(90deg,#f5a623,#f7b731)}
.cmp-it .cb.c2{background:linear-gradient(90deg,#5b8def,#7aa3f0)}
.cmp-it .cb.c3{background:linear-gradient(90deg,#e84a6e,#f06a7e)}
.cmp-it .cb.c4{background:linear-gradient(90deg,#a855f7,#c084fc)}

/* ===== Stats Row ===== */
.sr{display:flex;gap:4px;margin-bottom:2px;align-items:center}
.sr .lb{width:60px;font-size:10px;color:#8a7ea8;text-align:right;flex-shrink:0}
.sr .bb{flex:1;height:10px;background:#231d3a;border-radius:3px;overflow:hidden}
.sr .bb .bf{height:100%;border-radius:3px}
.sr .vl{width:24px;font-size:10px;color:#d8d0f0;text-align:right}

/* ===== Mini Chart ===== */
.mnb{display:inline-block;width:16px;margin:0 1px;border-radius:2px;vertical-align:bottom}

/* ===== Tags ===== */
.tag{display:inline-block;font-size:9px;padding:1px 5px;border-radius:2px;background:rgba(124,92,252,.08);color:#9b7cfc;letter-spacing:.5px}

/* ===== Utilities ===== */
.flx{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.mt{margin-top:10px}.mb{margin-bottom:10px}
.w100{width:100%}

/* ===== Responsive ===== */
@media(max-width:720px){.ctx{flex-direction:column}.sb{width:100%;height:auto;position:static;flex-direction:row;padding:10px 14px;border-right:none;border-bottom:1px solid #2f2848;overflow-x:auto}.sb .lg{display:none}.sb a{padding:6px 12px;white-space:nowrap;border-right:none;border-bottom:2px solid transparent;font-size:12px}.sb a.act{border-bottom-color:#7c5cfc;border-right:none}.sb .sp,.sb .ft{display:none}.mn{padding:16px}}
</style>`;

function layout(title, content, active) {
  const items = [['/admin','📊 仪表盘'],['/admin/results','📋 数据'],['/admin/insights','📈 洞察'],['/admin/export','📥 导出']];
  active = active || '/admin';
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>${CSS}</head><body><div class="ctx"><div class="sb"><div class="lg">LBTI<span>管理后台</span></div>${items.map(([u,t]) => `<a href="${u}"${active===u?' class="act"':''}>${t}</a>`).join('')}<div class="sp"></div><div class="ft">恋爱人形测试 v2</div></div><div class="mn">${content}</div></div><script>
document.querySelectorAll('.btn-del').forEach(b=>b.onclick=function(){return confirm(this.dataset.msg||'确定？')});
</script></body></html>`;
}



export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // ─── 导出 CSV ───
  if (path === '/admin/export') {
    const rows = await env.DB.prepare('SELECT * FROM results ORDER BY created_at DESC').all();
    let csv = 'ID,类型,类别,废物等级,内心戏,冷淡值,极端度,矛盾度,答题,IP,位置,UserAgent,时间\n';
    for(const r of rows.results) {
      const loc = await locateIP(r.ip||'');
      csv += `${r.id},"${r.type} ${r.type_name}","${r.type_category||''}",${r.waste_level||1},${r.inner_drama||0},${r.coldness||0},${r.extreme||0},${r.conflict||0},"${(r.answers||'').replace(/"/g,'""')}","${r.ip||''}","${loc}","${(r.user_agent||'').replace(/"/g,'""')}","${r.created_at||''}"\n`;
    }
    return new Response('\uFEFF'+csv, { headers: { 'Content-Type': 'text/csv;charset=utf-8', 'Content-Disposition': 'attachment;filename=lbti-export.csv' } });
  }

  // ─── 删除 ───
  if (path.startsWith('/admin/delete/')) {
    const id = parseInt(path.replace('/admin/delete/', ''));
    await env.DB.prepare('DELETE FROM results WHERE id = ?').bind(id).run();
    return Response.redirect(url.origin + '/admin/results', 302);
  }

  // ─── 洞察页 ───
  if (path === '/admin/insights') {
    const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
    if (total === 0) return Response.redirect(url.origin + '/admin');

    // 七天趋势
    const daily = await env.DB.prepare("SELECT date(created_at) as d, COUNT(*) as c FROM results WHERE created_at >= datetime('now', '-7 days') GROUP BY d ORDER BY d").all();
    // 各维度平均值按类型
    const byType = await env.DB.prepare("SELECT type, type_name, AVG(inner_drama) as id, AVG(coldness) as cd, AVG(extreme) as ex, AVG(conflict) as cf, COUNT(*) as cnt FROM results GROUP BY type ORDER BY cnt DESC").all();
    // IP统计
    const ipStats = await env.DB.prepare("SELECT ip, COUNT(*) as c, MAX(created_at) as last FROM results WHERE ip != '' GROUP BY ip ORDER BY c DESC LIMIT 15").all();
    const uniqueIPs = (await env.DB.prepare("SELECT COUNT(DISTINCT ip) as c FROM results WHERE ip != ''").first()).c;
    // 小时分布
    const hourly = await env.DB.prepare("SELECT CAST(strftime('%H', created_at) AS INTEGER) as h, COUNT(*) as c FROM results GROUP BY h ORDER BY h").all();
    const maxH = Math.max(...hourly.results.map(x => x.c), 1);

    let content = `<h1>📈 数据洞察</h1>`;

    // 趋势图
    const maxD = Math.max(...daily.results.map(x => x.c), 1);
    content += `<div class="bx"><h3>近 7 天测试趋势</h3><div style="display:flex;align-items:flex-end;gap:4px;height:60px;padding:4px 0">`;
    daily.results.forEach(d => {
      const pct = Math.round(d.c / maxD * 100);
      content += `<div style="flex:1;text-align:center"><div class="mnb" style="height:${pct}%;background:linear-gradient(to top,#7c5cfc,#a07cff)"></div><div style="font-size:9px;color:#8a7ea8;margin-top:3px">${d.d?.substring(5)||''}</div><div style="font-size:10px;color:#d8d0f0">${d.c}</div></div>`;
    });
    if (!daily.results.length) content += '<div style="color:#8a7ea8;padding:20px">暂无可显示数据</div>';
    content += `</div></div>`;

    // 小时分布
    content += `<div class="bx"><h3>时段分布 (24h)</h3><div style="display:flex;align-items:flex-end;gap:4px;height:60px">`;
    hourly.results.forEach(h => {
      const pct = Math.round(h.c / maxH * 100);
      content += `<div style="flex:1;text-align:center"><div class="mnb" style="height:${pct}%;background:${pct>60?'#7c5cfc':pct>30?'#5b8def':'#4caf50'}"></div><div style="font-size:8px;color:#8a7ea8;margin-top:2px">${String(h.h).padStart(2,'0')}</div></div>`;
    });
    content += `</div></div>`;

    // 各类型维度对比
    content += `<div class="bx"><h3>各人格维度均值对比</h3>`;
    byType.results.forEach(t => {
      content += `<div class="cmp" style="margin:0 0 10px">`;
      content += `<div style="width:120px;font-size:12px;padding:6px 0;color:#d8d0f0;flex-shrink:0">${t.type} ${t.type_name} <span style="color:#8a7ea8;font-size:11px">(${t.cnt})</span></div>`;
      const dims = [
        {v: Math.round(t.id), label:'内心戏', cls:'c1'},
        {v: Math.round(t.cd), label:'冷淡值', cls:'c2'},
        {v: Math.round(t.ex), label:'极端度', cls:'c3'},
        {v: Math.round(t.cf), label:'矛盾度', cls:'c4'},
      ];
      dims.forEach(d => {
        content += `<div style="flex:1;min-width:60px"><div style="font-size:10px;color:#8a7ea8">${d.label}</div><div style="font-size:16px;font-weight:600">${d.v}%</div><div class="cb ${d.cls}" style="width:${d.v}%"></div></div>`;
      });
      content += `</div>`;
    });
    content += `</div>`;

    // IP统计
    content += `<div class="bx"><h3>IP 统计 <span style="font-size:12px;color:#8a7ea8;font-weight:400">${uniqueIPs} 个独立 IP</span></h3>`;
    ipStats.results.forEach(ip => {
      const pct = Math.round(ip.c / total * 100);
      content += `<div class="sr"><div class="lb mono">${(ip.ip||'未知').substring(0,15)}</div><div class="bb"><div class="bf bar-f" style="width:${pct}%;background:linear-gradient(90deg,#7c5cfc,#a07cff)"></div></div><div class="vl">${ip.c}</div></div>`;
    });
    if (!ipStats.results.length) content += '<div style="color:#8a7ea8;padding:12px;text-align:center">暂无IP数据</div>';
    content += `</div>`;

    return new Response(layout('洞察', content, '/admin/insights'), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }

  // ─── 详情页 ───
  if (path.startsWith('/admin/detail/')) {
    const id = parseInt(path.replace('/admin/detail/', ''));
    const row = await env.DB.prepare('SELECT * FROM results WHERE id = ?').bind(id).first();
    if (!row) return new Response('未找到', { status: 404 });
    if (row.answers) try { row.answers = JSON.parse(row.answers); } catch {}

    const qs = ['对象回了个"嗯" 你内心上演了什么大戏？','对象跟别人合影发了朋友圈 配文"今天很开心" 你？','你们刚吵完架 对象说"我想一个人静静" 你实际做了什么？','对象今天突然对你特别好 又是买奶茶又是接下班 你第一反应是什么？','你精心发了一条仅ta可见的朋友圈 ta没点赞 你会？','深夜刷手机 手滑给ta三年前的自拍点了个赞 你什么反应？','恋爱中最让你崩溃的瞬间是什么？','你发现对象好像在偷偷看你的手机 你什么反应？','对象突然问起你前任的事 你怎么应对？','凌晨三点你emo了 你会做什么？','如果用一句话描述你和对象目前的关系状态 那会是？','对象说"我想自己待一会儿" 你脑子里第一个念头是什么？','你心里比谁都清楚 自己在恋爱里最大的毛病是什么？','对象突然很认真地跟你说"我们不合适" 你的第一反应是？','客观地讲 你在恋爱里到底是一个什么样的物种？'];
    const qo = [["完了这个\"嗯\"字没有句号没有表情包 一定是厌了烦了不爱了 我把三天前的聊天记录翻出来逐字分析","心里咯噔一下迅速回了个表情包试探 然后每隔两分钟看一次ta有没有回","想那么多干嘛 可能就是打字累了 我也经常只回一个字 没什么大不了的","嗯就是嗯 打字而已哪有那么多戏 滑走","啊？什么嗯 我刚睡醒手机没电了才看到"],
    ["放大到像素级分析那人的穿搭表情站位距离 然后截图发闺蜜群开紧急会议讨论此事是否构成出轨","心里不舒服但拼命深呼吸告诉自己 正常的社交正常的社交正常的社交","点个赞划走 谁还没几个朋友 我也有自己的社交圈 没什么好在意的","不就一张照片吗 我又不是没有朋友","我根本不刷朋友圈 别人告诉我我才知道有这回事"],
    ["嘴上说好的 然后每隔十分钟发一条消息 到凌晨两点忍不住打了八个电话 边哭边问你是不是不爱我了","忍着不找 但每隔三十秒点亮手机看一眼有没有消息 觉也睡不着 像个傻逼","好 那你也冷静一下 各自消化 等双方都好了再聊 没必要逼太紧","行 那我也静静 先打两把游戏分散注意力","好 然后真的一周不说话 且真心觉得这样挺好的"],
    ["肯定是出轨了做亏心事了 开始偷偷查手机定位步数消费记录和外卖地址 准备收集证据","很开心但心里发毛 觉得这是最后的晚餐暴风雨前的宁静 忐忑不安","开心就完了 同时记下来 下次我也对ta好点 关系就是互相的","享受啊 管他为什么 先爽了再说","有吗？ta不是一直对我挺好的吗（其实不是）"],
    ["删掉 再发一条仅ta可见 再删 再发 循环直到ta点赞为止 不点不睡觉","有点emo有点失落 算了以后再也不搞这些了 爱咋咋地","可能没看到吧 等会儿再看看 真的没看到就算了 也不是什么大事","谁天天盯着赞看啊 发完我自己都忘了","我甚至不记得我发过朋友圈这回事"],
    ["心脏骤停瞳孔地震 秒取消 截图发给所有朋友说我要死了永别了这个世界","飞速取消假装无事发生 手汗已经浸透了手机屏幕 心里祈祷ta在睡觉没看到","取消就行了 谁大半夜不睡觉盯着通知看啊 就算看到了一笑而过","点就点了 又不是什么见不得人的事 大不了说是手滑","我根本不会去翻ta以前的东西 闲得慌"],
    ["已读不回 我真的会疯 你倒是回啊 已读到底是什么意思你告诉我 我等得心都碎了","敷衍三连 嗯嗯好的笑死哈哈哈哈 看了比吃苍蝇还难受 不如直接不回","其实还好 看场合吧 忙的时候正常 闲的时候敷衍那确实有点烦 但也不至于崩溃","一天发八百条消息 你是我对象还是我甲方 我看都看不过来","太粘人了 求你给我一点个人空间吧求求了"],
    ["又高兴又紧张 ta在乎我才看说明爱我 但我刚才是不是搜了什么不该搜的东西 心里开始疯狂回忆","假装没发现 但心里在祈祷千万别看到那个对话框 表面稳如老狗内心已经波涛汹涌","无所谓 看了就看了 手机里又没什么见不得人的 正好说明ta在乎这段关系","看呗随便看 我又没有见不得人的东西 身正不怕影子斜","过了两个月才突然反应过来 哦那天原来是在看我手机啊"],
    ["嘴上云淡风轻说都过去了 但心里已经把前任从出生到分手所有罪行列了一张清单从头到尾骂了一遍","简单说两句然后赶紧反问你怎么突然问这个你是不是在意你是不是吃醋了","正常回答就行 问什么答什么 没什么好隐瞒的 过去了就是过去了 坦诚比遮掩强","前任？什么前任 不记得了 没这号人 档案已销毁","哪个前任 我谈过恋爱吗 哦那个啊 不太熟 真的不熟"],
    ["打开备忘录写一篇八百字小作文发给ta 主题是没你我怎么活这个夜我熬不下去了 边写边哭","发一条仅ta可见的阴间负能量朋友圈配一张黑白图 等着ta来救赎我","翻翻手机听会儿歌 等这股劲儿过去 明天醒了就好了 深夜做的决定没有几个是靠谱的","自己消化 戴上耳机听会儿歌睡一觉明天就好了","emo是什么意思 是某种食物吗 我只知道我很困要睡觉"],
    ["我在硬撑 其实我已经感觉到ta淡了但我还像一条狗一样死守着这段关系 我知道没出息但我做不到","还行吧 但总觉得哪里不太对劲 说不上来具体是什么 就是心里不踏实","正常相处中 有好的时候也有不好的时候 哪有天天甜甜的恋爱 能过就行","挺好的啊能有什么问题 我真的很幸福（其实心里压了三件事一直没说出口）","挺好的 ta也觉得挺好的吧 大概 可能 也许"],
    ["完了完了完了绝对是要分手了 开始在备忘录里起草分手挽留小论文 从相识到相爱写了一千字","嘴上说好的好的你休息吧 但心里把最近一周的所有对话每个表情每个标点都复盘了一遍","每个人都有需要独处的时候 我也需要 给他空间就是给关系空间 不是什么大事","行 那我也自己待会儿 去打两把游戏分散一下注意力","哦 好的 然后真的不去打扰ta 三天后反而是ta主动来找我"],
    ["太在乎了 在乎到让人窒息 我自己知道但我真的改不了 我也想洒脱但做不到","太能脑补了 对方一个标点符号我能分析出八百种含义 然后自己把自己吓死","说不上有什么大毛病 就是普通人谈普通恋爱 有点小问题但谁没有呢","太冷淡了 冷得像一具尸体 对方可能根本感觉不到我在谈恋爱","我可能根本就不需要谈恋爱 有没有都一样 我一个人也挺好的"],
    ["疯狂追问到底哪里不合适我可以改我真的可以改 你告诉我我改求你了你说啊我改还不行吗","问清楚原因 但绝不纠缠 问完转身就走 回到家门关上的那一刻才开始崩溃大哭","行 听ta说完 如果真的不合适那也没办法 强扭的瓜不甜 至少认真聊过再散","行吧 你说不合适就不合适吧 然后躲被子里哭一晚上 但绝对不会让ta知道","好 收到 了解了 然后这个人好像从来没在我的生命里出现过 微信也懒得删"],
    ["缺爱的小孩 表面大大咧咧没心没肺 但内心一碰就碎得稀烂 需要很多很多的爱才能填满","敏感怪物 需要对象每天说一百遍爱我 不然就觉得对方肯定是不爱了要跑了","正常人一个 恋爱脑的时候上头 清醒的时候理性 谈不上特别好但也不至于祸害人间","独立成熟的成年人 但独立到好像根本就不需要恋爱这种麻烦的东西","一个人真的挺好的 谈恋爱只是人生的一个可选DLC 可装可不装不装也行"]];

    const dims = [
      {l:'内心戏',v:row.inner_drama,c:'#f5a623'},{l:'冷淡值',v:row.coldness,c:'#5b8def'},
      {l:'极端度',v:row.extreme,c:'#e84a6e'},{l:'矛盾度',v:row.conflict,c:'#a855f7'},
    ];

    let ansHtml = '';
    if (Array.isArray(row.answers)) {
      ansHtml = '<table><thead><tr><th>#</th><th style="min-width:220px">题目</th><th>选项</th><th style="min-width:200px">答案内容</th></tr></thead><tbody>';
      row.answers.forEach((a, i) => ansHtml += `<tr><td>${i+1}</td><td style="font-size:12px">${qs[i]||'?'}</td><td><span class="tag">${['A','B','C','D','E'][a]||'-'}</span></td><td style="font-size:12px;color:#d8d0f0">${(qo[i]||[])[a]||'-'}</td></tr>`);
      ansHtml += '</tbody></table>';
    }

    const content = `
      <div class="flex mb"><a href="/admin/results" class="back" style="color:#8a7ea8;font-size:13px">← 返回列表</a><span style="color:#2f2848">|</span><a href="/admin/delete/${row.id}" class="btn btn-del btn-sm">🗑 删除</a></div>
      <h1>详情 #${row.id} <span class="sub">${wasteNames[row.waste_level]||''}</span></h1>
      <div class="cmp mb">
        <div class="cmp-it"><div class="ct">类型</div><div class="cv" style="font-size:18px">${row.type} ${row.type_name}</div><div class="ct mt">${row.type_category||''}</div></div>
        ${dims.map(d => `<div class="cmp-it"><div class="ct">${d.l}</div><div class="cv">${d.v||0}%</div><div class="cb" style="background:${d.c};width:${Math.min(d.v||0,100)}%"></div></div>`).join('')}
      </div>
      <div class="bx"><h3>答题记录</h3>${ansHtml||'<p style="color:#8a7ea8">无答题数据</p>'}</div>
      <div class="bx"><h3>设备和来源</h3><table><tbody>
        <tr><td style="width:80px;color:#8a7ea8">IP</td><td class="mono">${row.ip||'-'}</td></tr>
        <tr><td style="color:#8a7ea8">位置</td><td id="loc-${row.id}" class="dim"><span style="color:#5a5070">查询中…</span></td></tr>
        <tr><td style="color:#8a7ea8">时间</td><td>${row.created_at||'-'}</td></tr>
        <tr><td style="color:#8a7ea8">UA</td><td class="mono dim" style="font-size:11px;word-break:break-all">${row.user_agent||'-'}</td></tr>
      </tbody></table></div>
<script>fetch('/admin/locate/${row.ip}').then(r=>r.text()).then(t=>document.getElementById('loc-${row.id}').innerHTML=t).catch(()=>{});</script>`;
    return new Response(layout(`#${row.id}`, content, '/admin/results'), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }

  // ─── 结果列表 ───
  if (path === '/admin/results') {
    const page = Math.max(1, parseInt(url.searchParams.get('p')) || 1);
    const limit = 30;
    const offset = (page - 1) * limit;
    const search = url.searchParams.get('q') || '';
    const typeFilter = url.searchParams.get('type') || '';
    const sort = url.searchParams.get('sort') || 'created_at';
    const dir = url.searchParams.get('dir') || 'DESC';

    let w = [{c:'1=1',p:[]}];
    if (search) w.push({c:'(type_name LIKE ? OR ip LIKE ?)',p:[`%${search}%`,`%${search}%`]});
    if (typeFilter) w.push({c:'type = ?',p:[typeFilter]});
    const where = w.map(x=>x.c).join(' AND ');
    const params = w.flatMap(x=>x.p);

    const allowedSort = {created_at:'created_at',inner_drama:'inner_drama',coldness:'coldness',extreme:'extreme',conflict:'conflict',waste_level:'waste_level'};
    const sCol = allowedSort[sort] || 'created_at';
    const sDir = dir === 'ASC' ? 'ASC' : 'DESC';

    const total = (await env.DB.prepare(`SELECT COUNT(*) as c FROM results WHERE ${where}`).bind(...params).first()).c;
    const rows = await env.DB.prepare(`SELECT * FROM results WHERE ${where} ORDER BY ${sCol} ${sDir} LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
    const totalPages = Math.ceil(total / limit);
    const types = (await env.DB.prepare('SELECT DISTINCT type, type_name FROM results ORDER BY type').all()).results;

    const qp = (k,v) => `&${k}=${encodeURIComponent(v||'')}`;

    let content = `<h1>📋 数据 <span class="sub">共 ${total} 条</span></h1>
      <div class="fl">
        <form method="GET" id="ff" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <input type="text" name="q" placeholder="🔍 搜索类型/IP..." value="${search}" style="width:180px">
          <select name="type"><option value="">全部类型</option>${types.map(t => `<option value="${t.type}"${t.type===typeFilter?' selected':''}>${t.type} ${t.type_name}</option>`).join('')}</select>
          <button class="btn btn-sm" type="submit">筛选</button>
          ${search||typeFilter?`<a href="/admin/results" class="btn btn-sm">清除</a>`:''}
        </form>
      </div>
      <table><thead><tr>
        ${['ID','类型','等级','内心戏','冷淡值','极端度','矛盾度','IP','时间'].map((l,i)=>`<th>${['','','','inner_drama','coldness','extreme','conflict','','created_at'][i]?`<a href="?sort=${['','','','inner_drama','coldness','extreme','conflict','','created_at'][i]}&dir=${sort==['','','','inner_drama','coldness','extreme','conflict','','created_at'][i]&&dir==='DESC'?'ASC':'DESC'}${qp('q',search)}${qp('type',typeFilter)}${qp('p',page)}">${l} ${sort==['','','','inner_drama','coldness','extreme','conflict','','created_at'][i]?(dir==='DESC'?'▼':'▲'):''}</a>`:l}</th>`).join('')}
        <th></th></tr></thead><tbody>`;

    rows.results.forEach(r => {
      content += `<tr><td>#${r.id}</td><td><a href="/admin/detail/${r.id}">${r.type} ${r.type_name}</a></td><td>${wasteNames[r.waste_level]||''}</td><td>${r.inner_drama||0}</td><td>${r.coldness||0}</td><td>${r.extreme||0}</td><td>${r.conflict||0}</td><td class="dim mono">${(r.ip||'').substring(0,12)}</td><td class="dim" style="white-space:nowrap">${(r.created_at||'').substring(0,16)}</td><td><a href="/admin/delete/${r.id}" data-msg="删除 #${r.id}？" class="btn-del btn-sm" style="color:#e84a6e;font-size:11px">✕</a></td></tr>`;
    });
    if (!rows.results.length) content += '<tr><td colspan="10" style="text-align:center;padding:30px;color:#8a7ea8">暂无数据</td></tr>';
    content += '</tbody></table>';

    if (totalPages > 1) {
      content += '<div class="pg">';
      if (page > 1) content += `<a href="?p=${page-1}${qp('q',search)}${qp('type',typeFilter)}">←</a>`;
      const range = [...Array(Math.min(totalPages,9)).keys()].map(i => Math.max(1,Math.min(i+page-4, totalPages-8)));
      range.forEach(p => content += p===page ? `<span class="cur">${p}</span>` : `<a href="?p=${p}${qp('q',search)}${qp('type',typeFilter)}">${p}</a>`);
      if (page < totalPages) content += `<a href="?p=${page+1}${qp('q',search)}${qp('type',typeFilter)}">→</a>`;
      content += '</div>';
    }

    return new Response(layout('数据', content, '/admin/results'), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }

  // ─── IP 定位 ───
  if (path.startsWith('/admin/locate/')) {
    const ip = decodeURIComponent(path.replace('/admin/locate/', ''));
    const loc = await locateIP(ip);
    return new Response(loc, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
  }

  // ─── 仪表盘 ───
  const total = (await env.DB.prepare('SELECT COUNT(*) as c FROM results').first()).c;
  const today = (await env.DB.prepare("SELECT COUNT(*) as c FROM results WHERE date(created_at) = date('now')").first()).c;
  const typeDist = await env.DB.prepare('SELECT type, type_name, COUNT(*) as count FROM results GROUP BY type ORDER BY count DESC').all();
  const wasteDist = await env.DB.prepare('SELECT waste_level, COUNT(*) as count FROM results GROUP BY waste_level ORDER BY waste_level').all();
  const avgDrama = (await env.DB.prepare('SELECT AVG(inner_drama) as v FROM results').first())?.v || 0;
  const avgCold = (await env.DB.prepare('SELECT AVG(coldness) as v FROM results').first())?.v || 0;
  const avgExtreme = (await env.DB.prepare('SELECT AVG(extreme) as v FROM results').first())?.v || 0;
  const avgConflict = (await env.DB.prepare('SELECT AVG(conflict) as v FROM results').first())?.v || 0;
  const latest = await env.DB.prepare('SELECT id, type, type_name, waste_level, inner_drama, coldness, created_at FROM results ORDER BY created_at DESC LIMIT 10').all();
  const uniqueIPs = (await env.DB.prepare("SELECT COUNT(DISTINCT ip) as c FROM results WHERE ip != ''").first()).c;

  let content = `<h1>📊 LBTI 管理后台</h1>
    <p style="font-size:13px;color:#8a7ea8;margin-bottom:4px">${total} 次测试 · ${uniqueIPs} 个独立用户 · 最后更新刚刚</p>`;
  

  if (total === 0) {
    content += `<div class="cards"><div class="card"><div class="n">0</div><div class="l">总测试数</div></div></div><p style="color:#8a7ea8;padding:30px;text-align:center">暂无数据，快去测一下吧 → <a href="/">测试页面</a></p>`;
    return new Response(layout('LBTI 后台', content, '/admin'), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
  }

  content += `<div class="cards">
    <div class="card"><div class="n">${total}</div><div class="l">总测试数</div><div class="s">今日 +${today}</div></div>
    <div class="card"><div class="n">${uniqueIPs}</div><div class="l">独立用户</div></div>
    <div class="card"><div class="n">${Math.round(avgDrama)}%</div><div class="l">平均内心戏</div></div>
    <div class="card"><div class="n">${Math.round(avgCold)}%</div><div class="l">平均冷淡值</div></div>
  </div>`;

  // 四维度对比
  content += `<div class="cmp">
    <div class="cmp-it"><div class="ct">💭 内心戏</div><div class="cv" style="color:#f5a623">${Math.round(avgDrama)}%</div><div class="cb c1" style="width:${Math.round(avgDrama)}%"></div></div>
    <div class="cmp-it"><div class="ct">❄️ 冷淡值</div><div class="cv" style="color:#5b8def">${Math.round(avgCold)}%</div><div class="cb c2" style="width:${Math.round(avgCold)}%"></div></div>
    <div class="cmp-it"><div class="ct">🔥 极端度</div><div class="cv" style="color:#e84a6e">${Math.round(avgExtreme)}%</div><div class="cb c3" style="width:${Math.round(avgExtreme)}%"></div></div>
    <div class="cmp-it"><div class="ct">🌀 矛盾度</div><div class="cv" style="color:#a855f7">${Math.round(avgConflict)}%</div><div class="cb c4" style="width:${Math.round(avgConflict)}%"></div></div>
  </div>`;

  // 人格分布
  content += `<h2>人格分布</h2>`;
  typeDist.results.forEach(t => {
    const pct = Math.round(t.count / total * 100);
    content += `<div class="bar"><div class="bar-l"><span><a href="/admin/results?type=${t.type}">${t.type} ${t.type_name}</a></span><span>${t.count} <span style="color:#5a5070">${pct}%</span></span></div><div class="bar-t"><div class="bar-f" style="width:${pct}%"></div></div></div>`;
  });

  // 废物等级
  content += `<h2>废物等级分布</h2>`;
  const wasteColors = ['','g','g','o','r','r'];
  wasteDist.results.forEach(w => {
    const pct = Math.round(w.count / total * 100);
    content += `<div class="bar"><div class="bar-l"><span>${wasteNames[w.waste_level]||'未知'}</span><span>${w.count} <span style="color:#5a5070">${pct}%</span></span></div><div class="bar-t"><div class="bar-f ${wasteColors[w.waste_level]||''}" style="width:${pct}%"></div></div></div>`;
  });

  // 最新
  content += `<h2>最新测试</h2><table><thead><tr><th>ID</th><th>类型</th><th>等级</th><th>维度</th><th>时间</th></tr></thead><tbody>`;
  latest.results.forEach(r => {
    content += `<tr><td>#${r.id}</td><td><a href="/admin/detail/${r.id}">${r.type} ${r.type_name}</a></td><td>${wasteNames[r.waste_level]||''}</td><td class="dim">${r.inner_drama||0}/${r.coldness||0}</td><td class="dim" style="white-space:nowrap">${(r.created_at||'').substring(0,16)}</td></tr>`;
  });
  content += '</tbody></table>';

  return new Response(layout('LBTI 后台', content, '/admin'), { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
}
