#!/bin/bash

echo "========================================="
echo "安装 MongoDB - 自动脚本"
echo "========================================="
echo ""

echo "步骤 1: 更新命令行工具..."
echo "请在新终端窗口运行以下命令："
echo "  sudo rm -rf /Library/Developer/CommandLineTools"
echo "  sudo xcode-select --install"
echo ""
echo "等待命令行工具安装完成后，按 Enter 继续..."
read -p "按 Enter 继续..."

echo ""
echo "步骤 2: 安装 MongoDB..."
brew tap mongodb/brew
brew install mongodb-community

echo ""
echo "步骤 3: 启动 MongoDB..."
brew services start mongodb-community

echo ""
echo "步骤 4: 等待 MongoDB 启动..."
sleep 3

echo ""
echo "步骤 5: 检查 MongoDB 状态..."
if pgrep -x mongod > /dev/null; then
    echo "✓ MongoDB 已启动！"
    echo ""
    echo "现在可以刷新浏览器页面，应用应该可以正常工作了！"
else
    echo "✗ MongoDB 启动失败"
    echo "请手动运行: brew services start mongodb-community"
fi

echo ""
echo "========================================="

