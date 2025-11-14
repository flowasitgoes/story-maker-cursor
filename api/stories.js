const { stories, paragraphs } = require('../server/data/storage');

module.exports = async (req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET' && !req.query.id) {
      // 获取所有故事
      const allStories = await stories.findAll();
      const sortedStories = allStories.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      return res.json(sortedStories);
    }

    if (req.method === 'GET' && req.query.id) {
      // 获取故事详情和树状结构
      const story = await stories.findById(req.query.id);
      if (!story) {
        return res.status(404).json({ error: '故事不存在' });
      }
      
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
      
      return res.json({ story, tree, paragraphs: allParagraphs });
    }

    if (req.method === 'POST') {
      // 创建新故事
      const { title, initialContent, author, location } = req.body;
      
      const story = await stories.create({ title });
      
      const rootParagraph = await paragraphs.create({
        storyId: story._id,
        content: initialContent || '',
        author: author || '匿名',
        location: location || ''
      });
      
      await stories.update(story._id, { rootParagraphId: rootParagraph._id });
      story.rootParagraphId = rootParagraph._id;
      
      return res.status(201).json({ story, rootParagraph });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

