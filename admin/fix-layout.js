const fs = require('fs');
const path = require('path');

const file = path.join('D:', 'openclaw-workspace', '依恋类型测试', 'functions', 'admin', '[[path]].js');
let c = fs.readFileSync(file, 'utf8');

// Fix layout calls missing the 3rd parameter
c = c.replace(
  "layout('洞察', content)",
  "layout('洞察', content, '/admin/insights')"
);
c = c.replace(
  "layout(`#${row.id}`, content)",
  "layout(`#${row.id}`, content, '/admin/results')"
);
c = c.replace(
  "layout('数据', content)",
  "layout('数据', content, '/admin/results')"
);

fs.writeFileSync(file, c, 'utf8');
console.log('Fixed layout calls');
