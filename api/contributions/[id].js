const { contributions } = require('../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const contributionId = req.query.id;

  try {
    if (req.method === 'GET') {
      const contribution = await contributions.findById(contributionId);
      if (!contribution) {
        return res.status(404).json({ error: '接话不存在' });
      }
      return res.json(contribution);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

