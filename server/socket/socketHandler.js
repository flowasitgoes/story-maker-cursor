module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('用户已连接:', socket.id);

    // 加入故事房间
    socket.on('join:story', (storyId) => {
      socket.join(`story:${storyId}`);
      console.log(`用户 ${socket.id} 加入故事 ${storyId}`);
    });

    // 离开故事房间
    socket.on('leave:story', (storyId) => {
      socket.leave(`story:${storyId}`);
      console.log(`用户 ${socket.id} 离开故事 ${storyId}`);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log('用户已断开连接:', socket.id);
    });
  });

  // 广播故事更新
  const broadcastStoryUpdate = (storyId, data) => {
    io.to(`story:${storyId}`).emit('story:update', data);
  };

  // 广播新段落
  const broadcastNewParagraph = (storyId, paragraph) => {
    io.to(`story:${storyId}`).emit('paragraph:new', paragraph);
  };

  // 广播新接话
  const broadcastNewContribution = (storyId, contribution) => {
    io.to(`story:${storyId}`).emit('contribution:new', contribution);
  };

  // 广播接话被接受
  const broadcastContributionAccepted = (storyId, data) => {
    io.to(`story:${storyId}`).emit('contribution:accepted', data);
  };

  // 导出广播函数供路由使用
  return {
    broadcastStoryUpdate,
    broadcastNewParagraph,
    broadcastNewContribution,
    broadcastContributionAccepted
  };
};

