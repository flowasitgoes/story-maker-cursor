const { paragraphs } = require('../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const paragraphId = req.query.id;

  try {
    if (req.method === 'GET') {
      // 获取段落详情
      const paragraph = await paragraphs.findById(paragraphId);
      if (!paragraph) {
        return res.status(404).json({ error: '段落不存在' });
      }
      return res.json(paragraph);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

