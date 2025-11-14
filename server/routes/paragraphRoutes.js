const express = require('express');
const router = express.Router();
const { paragraphs, contributions } = require('../data/storage');

// 获取 socketBroadcast 中间件
const getSocketBroadcast = (req) => {
  return req.app.get('socketBroadcast');
};

// 获取段落详情
router.get('/:id', async (req, res) => {
  try {
    const paragraph = await paragraphs.findById(req.params.id);
    if (!paragraph) {
      return res.status(404).json({ error: '段落不存在' });
    }
    res.json(paragraph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 提交接话
router.post('/:id/contributions', async (req, res) => {
  try {
    const { content, author } = req.body;
    
    const contribution = await contributions.create({
      paragraphId: req.params.id,
      content,
      author: author || '匿名',
      status: 'pending'
    });
    
    // 获取段落以获取 storyId
    const paragraph = await paragraphs.findById(req.params.id);
    if (paragraph) {
      // 广播新接话
      const socketBroadcast = getSocketBroadcast(req);
      if (socketBroadcast) {
        socketBroadcast.broadcastNewContribution(paragraph.storyId, contribution);
      }
    }
    
    res.status(201).json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取段落的所有接话
router.get('/:id/contributions', async (req, res) => {
  try {
    const allContributions = await contributions.findByParagraphId(req.params.id);
    // 按创建时间倒序排列
    const sorted = allContributions.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sorted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
