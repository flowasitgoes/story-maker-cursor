# MongoDB Atlas 设置指南

## 快速步骤（5-10分钟）

### 步骤 1: 注册账号
1. 访问: https://www.mongodb.com/cloud/atlas/register
2. 点击 "Try Free" 按钮
3. 填写注册信息（邮箱、密码等）
4. 验证邮箱

### 步骤 2: 创建免费集群
1. 登录后，点击 "Build a Database"
2. 选择 **"M0 FREE"** 免费套餐
3. 选择云服务商（AWS）和区域（可以选择最近的，如 us-east-1）
4. 集群名称保持默认（Cluster0）或自定义
5. 点击 **"Create"** 按钮
6. 等待集群创建完成（约1-3分钟）

### 步骤 3: 创建数据库用户
1. 在 "Database Access" 页面，点击 "Add New Database User"
2. 认证方式选择 "Password"
3. 用户名: `admin`（或任意用户名）
4. 密码: 设置一个强密码（**记住它！**）
5. 用户权限: 选择 "Atlas admin" 或 "Read and write to any database"
6. 点击 "Add User"

### 步骤 4: 配置网络访问
1. 点击左侧菜单 "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（输入 `0.0.0.0/0`）
   - 或者点击 "Add Current IP Address" 添加当前 IP
4. 点击 "Confirm"
5. 等待几秒钟让设置生效

### 步骤 5: 获取连接字符串
1. 点击左侧菜单 "Database"
2. 点击集群旁边的 "Connect" 按钮
3. 选择 "Connect your application"
4. 驱动选择 "Node.js"，版本选择最新
5. 复制连接字符串，格式类似：
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 步骤 6: 配置应用
1. 将连接字符串中的 `<password>` 替换为你设置的密码
2. 在连接字符串的 `/` 后面添加数据库名称 `story-make`，例如：
   ```
   mongodb+srv://admin:你的密码@cluster0.xxxxx.mongodb.net/story-make?retryWrites=true&w=majority
   ```
3. 在项目根目录创建 `.env` 文件（如果还没有）
4. 添加以下内容：
   ```
   MONGODB_URI=mongodb+srv://admin:你的密码@cluster0.xxxxx.mongodb.net/story-make?retryWrites=true&w=majority
   PORT=3000
   ```

### 步骤 7: 重启服务器
运行以下命令重启后端服务器：
```bash
pkill -f "node server.js"
npm start
```

### 步骤 8: 验证连接
1. 访问: http://localhost:3000/health
2. 应该看到: `"database": "connected"`
3. 刷新浏览器页面: http://localhost:4200
4. 现在应该可以正常使用了！

## 常见问题

### 连接失败？
1. 检查密码是否正确（注意特殊字符需要 URL 编码）
2. 检查网络访问设置（IP 地址是否已添加）
3. 检查连接字符串格式是否正确
4. 等待几分钟让设置生效

### 忘记密码？
在 Atlas 控制台的 "Database Access" 页面可以重置密码

### 需要帮助？
查看 MongoDB Atlas 文档: https://docs.atlas.mongodb.com/

