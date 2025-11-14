const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../data/input-logs.json');

// 确保日志文件存在
async function ensureLogFile() {
  try {
    await fs.access(LOG_FILE);
  } catch {
    // 文件不存在，创建新文件
    await fs.writeFile(LOG_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

// 安全读取日志文件
async function safeReadLogs() {
  try {
    const content = await fs.readFile(LOG_FILE, 'utf8');
    // 尝试解析JSON
    try {
      const logs = JSON.parse(content);
      if (!Array.isArray(logs)) {
        console.warn('日志文件格式错误，重置为空数组');
        return [];
      }
      return logs;
    } catch (parseError) {
      console.error('日志文件JSON解析失败:', parseError.message);
      // JSON损坏，备份原文件并创建新文件
      try {
        const backupFile = LOG_FILE + '.backup.' + Date.now();
        await fs.copyFile(LOG_FILE, backupFile);
        console.log('已备份损坏的日志文件到:', backupFile);
      } catch (backupError) {
        console.error('备份日志文件失败:', backupError.message);
      }
      // 返回空数组
      return [];
    }
  } catch (readError) {
    // 文件读取失败，可能是文件不存在
    console.error('读取日志文件失败:', readError.message);
    return [];
  }
}

// 安全写入日志文件
async function safeWriteLogs(logs) {
  try {
    // 限制日志数量（保留最近1000条）
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    // 写入文件
    await fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8');
    return true;
  } catch (writeError) {
    console.error('写入日志文件失败:', writeError.message);
    return false;
  }
}

// 记录输入日志
router.post('/', async (req, res) => {
  try {
    await ensureLogFile();
    
    const logEntry = {
      ...req.body,
      receivedAt: new Date().toISOString()
    };
    
    // 安全读取现有日志
    const logs = await safeReadLogs();
    
    // 添加新日志
    logs.push(logEntry);
    
    // 安全写入日志
    const writeSuccess = await safeWriteLogs(logs);
    
    if (writeSuccess) {
      console.log('[LOG]', logEntry.action || '未知操作', logEntry.data || {});
      res.json({ success: true });
    } else {
      // 写入失败，但仍然返回成功，避免影响主功能
      console.error('[LOG] 日志写入失败，但继续执行');
      res.json({ success: false, warning: '日志写入失败' });
    }
  } catch (error) {
    console.error('日志记录失败:', error);
    // 返回成功，避免影响主功能
    res.status(200).json({ success: false, error: error.message });
  }
});

// 获取日志（用于调试）
router.get('/', async (req, res) => {
  try {
    await ensureLogFile();
    const logs = await safeReadLogs();
    res.json(logs);
  } catch (error) {
    console.error('获取日志失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
