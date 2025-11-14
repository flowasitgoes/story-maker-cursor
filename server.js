const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'json-file',
    message: '使用 JSON 文件存储'
  });
});

// 路由
const storyRoutes = require('./server/routes/storyRoutes');
const paragraphRoutes = require('./server/routes/paragraphRoutes');
const contributionRoutes = require('./server/routes/contributionRoutes');
const logRoutes = require('./server/routes/logRoutes');

app.use('/api/stories', storyRoutes);
app.use('/api/paragraphs', paragraphRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/logs', logRoutes);

// WebSocket 处理
const socketHandler = require('./server/socket/socketHandler');
const socketBroadcast = socketHandler(io);

// 将 socketBroadcast 附加到 app 以便路由使用
app.set('socketBroadcast', socketBroadcast);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log('✓ 使用 JSON 文件存储（data/ 目录）');
});
