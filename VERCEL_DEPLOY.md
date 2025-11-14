# Vercel 部署说明

## 重要注意事项

### 1. Socket.IO 限制
⚠️ **Vercel serverless functions 不支持 WebSocket**，因此 Socket.IO 的实时功能在 Vercel 上无法正常工作。

- Socket.IO 连接将被禁用（不会报错，但不会有实时更新）
- 应用仍然可以正常工作，但需要手动刷新页面来查看更新
- 如果需要实时功能，建议：
  - 使用其他部署方案（如 Railway、Render、Fly.io）
  - 或者使用轮询（polling）模式（已在代码中配置）

### 2. 数据存储
⚠️ **Vercel serverless functions 的文件系统是只读的**（除了 `/tmp` 目录）。

- 当前使用 JSON 文件存储，在 Vercel 上数据会存储在 `/tmp` 目录
- `/tmp` 目录的数据在函数执行后可能会被清除
- **建议在生产环境中使用外部数据库**：
  - MongoDB Atlas（推荐）
  - Supabase
  - Vercel KV (Redis)
  - 或其他数据库服务

### 3. 环境变量
如果需要配置 API URL 或 Socket URL，可以在 Vercel 项目设置中添加环境变量：
- `NG_APP_API_URL` - API 基础 URL（默认：`/api`）
- `NG_APP_SOCKET_URL` - Socket.IO URL（默认：禁用）

## 部署步骤

1. **安装 Vercel CLI**（如果还没有）：
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**：
   ```bash
   vercel login
   ```

3. **部署项目**：
   ```bash
   vercel
   ```

4. **生产环境部署**：
   ```bash
   vercel --prod
   ```

## 项目结构

- `api/` - Vercel serverless functions
- `client/` - Angular 前端应用
- `server/` - 后端逻辑（被 API functions 使用）
- `data/` - JSON 数据文件（本地开发用）

## API 路由

Vercel 会自动识别 `api/` 目录下的文件作为 serverless functions：

- `GET /api/stories` - 获取所有故事
- `GET /api/stories/[id]` - 获取故事详情
- `POST /api/stories` - 创建新故事
- `POST /api/stories/[id]/paragraphs` - 添加段落
- `GET /api/paragraphs/[id]/contributions` - 获取接话
- `POST /api/paragraphs/[id]/contributions` - 提交接话
- `PUT /api/contributions/[id]/accept` - 接受接话
- `PUT /api/contributions/[id]/reject` - 拒绝接话
- `POST /api/logs` - 记录日志

## 故障排除

如果遇到 500 错误：

1. 检查 Vercel 函数日志
2. 确保所有依赖都已安装
3. 检查数据文件路径是否正确
4. 考虑使用外部数据库而不是文件存储

