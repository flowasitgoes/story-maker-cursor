const { contributions } = require('../../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const paragraphId = req.query.id;

  try {
    if (req.method === 'GET') {
      // 获取段落的所有接话
      const allContributions = await contributions.findByParagraphId(paragraphId);
      const sorted = allContributions.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      return res.json(sorted);
    }

    if (req.method === 'POST') {
      // 提交接话
      const { content, author } = req.body;
      
      const contribution = await contributions.create({
        paragraphId: paragraphId,
        content,
        author: author || '匿名',
        status: 'pending'
      });
      
      return res.status(201).json(contribution);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

