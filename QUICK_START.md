# 快速开始 - MongoDB Atlas

## 3 步完成设置

### 1. 获取 MongoDB Atlas 连接字符串

访问: https://www.mongodb.com/cloud/atlas/register

1. 注册账号（免费）
2. 创建免费 M0 集群
3. 创建数据库用户（用户名和密码）
4. 配置网络访问（添加 IP 地址 0.0.0.0/0）
5. 获取连接字符串

### 2. 配置 .env 文件

在项目根目录创建 `.env` 文件：

```bash
# 复制示例文件
cp .env.example .env
```

然后编辑 `.env` 文件，将连接字符串中的：
- `<password>` 替换为你的实际密码
- `cluster0.xxxxx` 替换为你的实际集群地址

完整格式：
```
MONGODB_URI=mongodb+srv://admin:你的密码@cluster0.xxxxx.mongodb.net/story-make?retryWrites=true&w=majority
PORT=3000
```

### 3. 测试连接并重启服务器

```bash
# 测试连接
npm run test-connection

# 如果连接成功，重启服务器
pkill -f "node server.js"
npm start
```

### 4. 验证

1. 访问: http://localhost:3000/health
2. 应该看到: `"database": "connected"`
3. 刷新浏览器: http://localhost:4200
4. 现在可以正常使用了！

## 详细步骤

查看 `SETUP_ATLAS.md` 获取详细步骤说明。

## 需要帮助？

- MongoDB Atlas 文档: https://docs.atlas.mongodb.com/
- 连接字符串格式: https://docs.atlas.mongodb.com/tutorial/connect-to-your-cluster/

