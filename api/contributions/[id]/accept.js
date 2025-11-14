const { contributions, paragraphs } = require('../../../server/data/storage');

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
      // 接受接话
      const contribution = await contributions.findById(contributionId);
      if (!contribution) {
        return res.status(404).json({ error: '接话不存在' });
      }
      
      if (contribution.status !== 'pending') {
        return res.status(400).json({ error: '接话已被处理' });
      }
      
      await contributions.update(contribution._id, { status: 'accepted' });
      contribution.status = 'accepted';
      
      const parentParagraph = await paragraphs.findById(contribution.paragraphId);
      if (!parentParagraph) {
        return res.status(404).json({ error: '父段落不存在' });
      }
      
      const newParagraph = await paragraphs.create({
        storyId: parentParagraph.storyId,
        content: contribution.content,
        author: contribution.author,
        location: parentParagraph.location || '',
        parentId: contribution.paragraphId,
        branchId: parentParagraph.branchId || null
      });
      
      return res.json({ contribution, newParagraph });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

