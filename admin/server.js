const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;

// CORS
app.use(function(req,res,next){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers','Content-Type');
  res.header('Access-Control-Allow-Methods','POST,GET,OPTIONS');
  if(req.method==='OPTIONS') return res.send(200);
  next();
});

// 中间件
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 视图引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 路由
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));

// 前端静态文件
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// 根路径重定向
app.get('/', (req, res) => res.redirect('/admin'));

const os = require('os');
const ifaces = os.networkInterfaces();
let ip = 'localhost';
Object.keys(ifaces).forEach(k => {
  ifaces[k].forEach(v => { if (v.family === 'IPv4' && !v.internal) ip = v.address; });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LBTI 全栈运行于 http://localhost:${PORT}`);
  console.log(`局域网访问 http://${ip}:${PORT}/index.html (手机/其他设备)`);
  console.log(`管理后台 http://${ip}:${PORT}/admin`);
});
