const express = require('express');
const router = express.Router();
const { stories, paragraphs } = require('../data/storage');

// 获取 socketBroadcast 中间件
const getSocketBroadcast = (req) => {
  return req.app.get('socketBroadcast');
};

// 获取所有故事
router.get('/', async (req, res) => {
  try {
    const allStories = await stories.findAll();
    // 按创建时间倒序排列
    const sortedStories = allStories.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json(sortedStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建新故事
router.post('/', async (req, res) => {
  try {
    const { title, initialContent, author, location } = req.body;
    
    // 创建故事
    const story = await stories.create({ title });
    
    // 创建根段落
    const rootParagraph = await paragraphs.create({
      storyId: story._id,
      content: initialContent || '',
      author: author || '匿名',
      location: location || ''
    });
    
    // 更新故事的根段落ID
    await stories.update(story._id, { rootParagraphId: rootParagraph._id });
    story.rootParagraphId = rootParagraph._id;
    
    // 广播新故事
    const socketBroadcast = getSocketBroadcast(req);
    if (socketBroadcast) {
      socketBroadcast.broadcastStoryUpdate(story._id, { story, rootParagraph });
    }
    
    res.status(201).json({ story, rootParagraph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取故事详情和树状结构
router.get('/:id', async (req, res) => {
  try {
    const story = await stories.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: '故事不存在' });
    }
    
    // 获取所有段落
    const allParagraphs = await paragraphs.findByStoryId(story._id);
    
    // 构建树状结构
    const paragraphMap = new Map();
    allParagraphs.forEach(p => {
      paragraphMap.set(p._id, {
        ...p,
        children: []
      });
    });
    
    const tree = [];
    allParagraphs.forEach(p => {
      const paraObj = paragraphMap.get(p._id);
      if (p.parentId) {
        const parent = paragraphMap.get(p.parentId);
        if (parent) {
          parent.children.push(paraObj);
        }
      } else {
        tree.push(paraObj);
      }
    });
    
    res.json({ story, tree, paragraphs: allParagraphs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加新段落
router.post('/:id/paragraphs', async (req, res) => {
  try {
    const { content, author, location, parentId, branchId } = req.body;
    
    console.log('添加段落 - 接收到的数据:', { content, author, location, parentId, branchId, storyId: req.params.id });
    
    // 如果 location 为空且 parentId 存在，从父段落获取 location
    let finalLocation = location || '';
    if (!finalLocation && parentId) {
      const parentParagraph = await paragraphs.findById(parentId);
      if (parentParagraph && parentParagraph.location) {
        finalLocation = parentParagraph.location;
        console.log('从父段落获取 location:', finalLocation);
      }
    }
    
    const paragraph = await paragraphs.create({
      storyId: req.params.id,
      content: content || '',
      author: author || '匿名',
      location: finalLocation,
      parentId: parentId || null,
      branchId: branchId || null
    });
    
    console.log('段落创建成功:', paragraph);
    
    // 广播新段落
    const socketBroadcast = getSocketBroadcast(req);
    if (socketBroadcast) {
      socketBroadcast.broadcastNewParagraph(req.params.id, paragraph);
    }
    
    res.status(201).json(paragraph);
  } catch (error) {
    console.error('添加段落失败:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
