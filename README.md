# 共創小說 Web App

一个类似 GitHub Pull Request 的共創小說平台，支持多分支故事结构、匿名参与和实时 WebSocket 更新。

## 功能特性

- 📚 创建和管理多个故事
- 🌳 多分支故事结构（树状结构）
- 💬 接话功能（类似 Pull Request）
- ✅ 接受/拒绝接话
- 🔄 实时更新（WebSocket）
- 👤 匿名参与（使用昵称）

## 技术栈

### 后端
- Node.js + Express
- MongoDB (Mongoose)
- Socket.io (WebSocket)

### 前端
- Angular
- TypeScript
- Socket.io-client

## 安装和运行

### 前置要求

1. Node.js (v18+)
2. MongoDB (需要先启动 MongoDB 服务)

### 安装和启动 MongoDB

**macOS (使用 Homebrew):**

1. 安装 MongoDB:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

2. 启动 MongoDB:
```bash
brew services start mongodb-community
```

或者直接运行:
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```

**Linux:**
```bash
# 安装 MongoDB
sudo apt-get install -y mongodb-org

# 启动服务
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Windows:**
```bash
# 下载并安装 MongoDB Community Server
# 访问: https://www.mongodb.com/try/download/community

# 启动服务
net start MongoDB
```

**使用项目提供的启动脚本:**
```bash
./start-mongodb.sh
```

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 启动服务器

**方式 1: 分别启动**

```bash
# 终端 1: 启动后端服务器 (端口 3000)
npm start

# 终端 2: 启动前端开发服务器 (端口 4200)
cd client
npm start
```

**方式 2: 使用后台进程**

后端和前端服务器已经在后台启动。

### 访问应用

打开浏览器访问: http://localhost:4200

后端 API: http://localhost:3000/api

## 项目结构

```
story-make-cursor/
├── server.js              # 后端主服务器文件
├── server/
│   ├── models/           # MongoDB 数据模型
│   ├── routes/           # API 路由
│   └── socket/           # WebSocket 处理
├── client/               # Angular 前端项目
│   └── src/
│       └── app/
│           ├── components/  # 组件
│           └── services/     # 服务
└── package.json
```

## API 端点

- `GET /api/stories` - 获取所有故事
- `POST /api/stories` - 创建新故事
- `GET /api/stories/:id` - 获取故事详情
- `POST /api/stories/:id/paragraphs` - 添加新段落
- `POST /api/paragraphs/:id/contributions` - 提交接话
- `PUT /api/contributions/:id/accept` - 接受接话
- `PUT /api/contributions/:id/reject` - 拒绝接话

## 使用说明

1. **创建故事**: 在首页点击"创建新故事"，填写标题、初始内容和作者信息
2. **查看故事**: 点击故事卡片进入故事详情页
3. **添加段落**: 在故事详情页点击"添加段落"按钮
4. **提交接话**: 点击某个段落，在右侧面板提交接话
5. **接受接话**: 在接话面板中点击"接受"按钮，接话会变成新的段落

## 环境变量

创建 `.env` 文件（可选）:

```
MONGODB_URI=mongodb://localhost:27017/story-make
PORT=3000
```

## 故障排除

### MongoDB 连接问题

如果遇到 "数据库连接失败" 错误：

1. **检查 MongoDB 是否运行:**
```bash
# 检查健康状态
curl http://localhost:3000/health

# 检查 MongoDB 进程
pgrep -x mongod
```

2. **启动 MongoDB:**
```bash
# macOS
brew services start mongodb-community

# 或使用项目脚本
./start-mongodb.sh
```

3. **检查 MongoDB 日志:**
```bash
# macOS
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### API 错误

如果 API 返回 503 错误，通常是 MongoDB 未连接。检查 `/health` 端点查看数据库状态。

## 注意事项

- 确保 MongoDB 服务正在运行才能保存数据
- 后端服务器运行在端口 3000
- 前端开发服务器运行在端口 4200
- WebSocket 连接会自动建立，支持实时更新
- 访问 `/health` 端点可以查看服务器和数据库状态

# story-maker-cursor
