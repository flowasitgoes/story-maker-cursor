const { paragraphs } = require('../../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const storyId = req.query.id;

  try {
    if (req.method === 'POST') {
      // 添加新段落
      const { content, author, location, parentId, branchId } = req.body;
      
      let finalLocation = location || '';
      if (!finalLocation && parentId) {
        const parentParagraph = await paragraphs.findById(parentId);
        if (parentParagraph && parentParagraph.location) {
          finalLocation = parentParagraph.location;
        }
      }
      
      const paragraph = await paragraphs.create({
        storyId: storyId,
        content: content || '',
        author: author || '匿名',
        location: finalLocation,
        parentId: parentId || null,
        branchId: branchId || null
      });
      
      return res.status(201).json(paragraph);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

