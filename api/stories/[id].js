const { stories, paragraphs } = require('../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vercel 动态路由参数
  const storyId = req.query.id;

  try {
    if (req.method === 'GET') {
      const story = await stories.findById(storyId);
      if (!story) {
        return res.status(404).json({ error: '故事不存在' });
      }
      
      const allParagraphs = await paragraphs.findByStoryId(story._id);
      
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

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

