const express = require('express');
const router = express.Router();
const { contributions, paragraphs } = require('../data/storage');

// 获取 socketBroadcast 中间件
const getSocketBroadcast = (req) => {
  return req.app.get('socketBroadcast');
};

// 接受接话
router.put('/:id/accept', async (req, res) => {
  try {
    const contribution = await contributions.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: '接话不存在' });
    }
    
    if (contribution.status !== 'pending') {
      return res.status(400).json({ error: '接话已被处理' });
    }
    
    // 更新接话状态
    await contributions.update(contribution._id, { status: 'accepted' });
    contribution.status = 'accepted';
    
    // 创建新段落（接受接话）
    const parentParagraph = await paragraphs.findById(contribution.paragraphId);
    if (!parentParagraph) {
      return res.status(404).json({ error: '父段落不存在' });
    }
    
    console.log('接受接话 - 创建新段落:', {
      storyId: parentParagraph.storyId,
      content: contribution.content,
      author: contribution.author,
      location: parentParagraph.location,
      parentId: contribution.paragraphId
    });
    
    const newParagraph = await paragraphs.create({
      storyId: parentParagraph.storyId,
      content: contribution.content,
      author: contribution.author,
      location: parentParagraph.location || '',
      parentId: contribution.paragraphId,
      branchId: parentParagraph.branchId || null
    });
    
    console.log('新段落创建成功:', newParagraph);
    
    // 广播接话被接受
    const socketBroadcast = getSocketBroadcast(req);
    if (socketBroadcast) {
      socketBroadcast.broadcastContributionAccepted(
        parentParagraph.storyId,
        { contribution, newParagraph }
      );
      socketBroadcast.broadcastNewParagraph(
        parentParagraph.storyId,
        newParagraph
      );
    }
    
    res.json({ contribution, newParagraph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 拒绝接话
router.put('/:id/reject', async (req, res) => {
  try {
    const contribution = await contributions.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: '接话不存在' });
    }
    
    if (contribution.status !== 'pending') {
      return res.status(400).json({ error: '接话已被处理' });
    }
    
    await contributions.update(contribution._id, { status: 'rejected' });
    contribution.status = 'rejected';
    
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取接话详情
router.get('/:id', async (req, res) => {
  try {
    const contribution = await contributions.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ error: '接话不存在' });
    }
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
