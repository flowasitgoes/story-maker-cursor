const fs = require('fs').promises;
const path = require('path');

// 注意：Vercel serverless functions 的文件系统是只读的（除了 /tmp）
// 在生产环境中，建议使用外部存储服务（如 MongoDB、Supabase 等）
const LOG_FILE = process.env.VERCEL 
  ? path.join('/tmp', 'input-logs.json')
  : path.join(__dirname, '../../data/input-logs.json');

async function ensureLogFile() {
  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

async function safeReadLogs() {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf8');
    try {
      const logs = JSON.parse(content);
      if (!Array.isArray(logs)) {
        return [];
      }
      return logs;
    } catch (parseError) {
      console.error('日志文件JSON解析失败:', parseError.message);
      return [];
    }
  } catch (readError) {
    console.error('读取日志文件失败:', readError.message);
    return [];
  }
}

async function safeWriteLogs(logs) {
  try {
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    return true;
  } catch (writeError) {
    console.error('写入日志文件失败:', writeError.message);
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      await ensureLogFile();
      
      const logEntry = {
        ...req.body,
        receivedAt: new Date().toISOString()
      };
      
      const logs = await safeReadLogs();
      logs.push(logEntry);
      
      const writeSuccess = await safeWriteLogs(logs);
      
      if (writeSuccess) {
        console.log('[LOG]', logEntry.action || '未知操作', logEntry.data || {});
        return res.json({ success: true });
      } else {
        return res.json({ success: false, warning: '日志写入失败' });
      }
    }

    if (req.method === 'GET') {
      await ensureLogFile();
      const logs = await safeReadLogs();
      return res.json(logs);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('日志记录失败:', error);
    res.status(200).json({ success: false, error: error.message });
  }
};

