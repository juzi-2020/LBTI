const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', '依恋类型测试', 'functions', 'admin', '[[path]].js');
let content = fs.readFileSync(file, 'utf8');

// Add location to column header
content = content.replace(
  "'ID,类型,类别,废物等级,内心戏,冷淡值,极端度,矛盾度,答题,IP,UserAgent,时间\\n'",
  "'ID,类型,类别,废物等级,内心戏,冷淡值,极端度,矛盾度,答题,IP,位置,UserAgent,时间\\n'"
);

// Replace forEach with for...of and add location lookup
content = content.replace(
  "rows.results.forEach(r => {\n      csv += `${r.id},\"${r.type} ${r.type_name}\",\"${r.type_category||''}\",${r.waste_level||1},${r.inner_drama||0},${r.coldness||0},${r.extreme||0},${r.conflict||0},\"${r.answers||''}\",\"${r.ip||''}\",\"${(r.user_agent||'').replace(/\"/g,'\"\"')}\",\"${r.created_at||''}\"\\n`;\n    });",
  "for(const r of rows.results) {\n      const loc = await locateIP(r.ip||'');\n      csv += `${r.id},\"${r.type} ${r.type_name}\",\"${r.type_category||''}\",${r.waste_level||1},${r.inner_drama||0},${r.coldness||0},${r.extreme||0},${r.conflict||0},\"${(r.answers||'').replace(/\"/g,'\"\"')}\",\"${r.ip||''}\",\"${loc}\",\"${(r.user_agent||'').replace(/\"/g,'\"\"')}\",\"${r.created_at||''}\"\\n`;\n    }"
);

// Fix BOM
content = content.replace(
  "return new Response('﻿'+csv",
  "return new Response('\\uFEFF'+csv"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed!');
