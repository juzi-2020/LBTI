# LBTI · 恋爱人形测试

> 你谈恋爱的时候，到底是个什么物种？

15 道题的抽象恋爱人格测试。测完给你 12 种见不得光的恋爱人格之一。

A→极度焦虑 ⇢ D→极度回避，四个档位覆盖你的恋爱操作。

## 项目结构

```
LBTI/
├── frontend/     # 纯前端页面 (HTML/CSS/JS)
│   ├── index.html      # 答题页 - 毛玻璃 UI，单题翻页式
│   ├── result.html     # 结果页 - 人格分析 + 匹配建议 + 扎心忠告
│   └── functions/      # Cloudflare Functions
│
├── admin/        # 管理后台 (Express.js)
│   ├── server.js       # 后端服务
│   ├── routes/         # API 路由
│   ├── views/          # EJS 模板
│   └── data/           # 数据存储
│
├── cloudflare/   # Cloudflare Workers
│   └── src/index.js    # Worker 入口
│
└── .gitignore
```

## 技术栈

- **前端**: 原生 HTML/CSS/JS，毛玻璃 UI 设计
- **后端**: Node.js + Express.js + EJS
- **部署**: Cloudflare Workers / Cloudflare Pages

## 快速开始

### 前端

直接打开 `frontend/index.html` 即可答题。

### 管理后台

```bash
cd admin
npm install
node server.js
```

### Cloudflare Workers

```bash
cd cloudflare
npm install
npx wrangler deploy
```

## License

MIT
