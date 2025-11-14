// 测试 MongoDB 连接
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/story-make';

console.log('正在测试 MongoDB 连接...');
console.log('连接字符串:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // 隐藏密码

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✓ MongoDB 连接成功！');
    console.log('数据库状态:', mongoose.connection.readyState === 1 ? '已连接' : '未连接');
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ MongoDB 连接失败:');
    console.error('错误信息:', err.message);
    console.error('');
    console.error('请检查:');
    console.error('1. .env 文件中的 MONGODB_URI 是否正确');
    console.error('2. 密码是否正确（注意特殊字符需要 URL 编码）');
    console.error('3. 网络访问设置是否正确（IP 地址是否已添加）');
    console.error('4. 连接字符串格式是否正确');
    process.exit(1);
  });

