# 启动 MongoDB - 快速指南

## 方案 1: 更新命令行工具后安装 MongoDB (推荐)

### 步骤 1: 更新命令行工具
```bash
sudo rm -rf /Library/Developer/CommandLineTools
sudo xcode-select --install
```
然后等待安装完成（可能需要10-20分钟）

### 步骤 2: 安装 MongoDB
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### 步骤 3: 启动 MongoDB
```bash
brew services start mongodb-community
```

## 方案 2: 使用 MongoDB Atlas (云数据库，无需安装)

### 步骤 1: 注册 MongoDB Atlas
访问: https://www.mongodb.com/cloud/atlas/register

### 步骤 2: 创建免费集群
- 选择免费的 M0 集群
- 选择区域（可以选择最近的）
- 创建集群

### 步骤 3: 获取连接字符串
- 点击 "Connect"
- 选择 "Connect your application"
- 复制连接字符串

### 步骤 4: 配置应用
在项目根目录创建 `.env` 文件：
```
MONGODB_URI=你的MongoDB Atlas连接字符串
PORT=3000
```

### 步骤 5: 配置网络访问
- 在 Atlas 控制台中，点击 "Network Access"
- 点击 "Add IP Address"
- 选择 "Allow Access from Anywhere" (0.0.0.0/0)
- 或者添加你的当前 IP 地址

## 方案 3: 使用在线 MongoDB (临时方案)

可以使用免费的在线 MongoDB 服务：
- https://www.mongodb.com/cloud/atlas/register (免费)
- https://www.mlab.com/ (已停止新用户注册)

## 验证安装

运行以下命令检查 MongoDB 是否运行：
```bash
curl http://localhost:3000/health
```

如果看到 `"database": "connected"`，说明连接成功！

