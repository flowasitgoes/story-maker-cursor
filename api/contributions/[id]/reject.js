const { contributions } = require('../../../server/data/storage');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const contributionId = req.query.id;

  try {
    if (req.method === 'PUT') {
      // 拒绝接话
      const contribution = await contributions.findById(contributionId);
      if (!contribution) {
        return res.status(404).json({ error: '接话不存在' });
      }
      
      if (contribution.status !== 'pending') {
        return res.status(400).json({ error: '接话已被处理' });
      }
      
      await contributions.update(contribution._id, { status: 'rejected' });
      contribution.status = 'rejected';
      
      return res.json(contribution);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

