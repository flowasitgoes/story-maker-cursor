#!/bin/bash

# MongoDB 启动脚本

echo "正在检查 MongoDB..."

# 检查 MongoDB 是否已安装
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB 已安装"
    
    # 尝试启动 MongoDB 服务
    if command -v brew &> /dev/null; then
        echo "正在启动 MongoDB 服务..."
        brew services start mongodb-community 2>&1 || {
            echo "尝试直接运行 mongod..."
            mongod --dbpath ~/data/db 2>&1 &
            echo "MongoDB 已在后台启动"
        }
    else
        echo "直接运行 mongod..."
        mongod --dbpath ~/data/db 2>&1 &
        echo "MongoDB 已在后台启动"
    fi
else
    echo "✗ MongoDB 未安装"
    echo ""
    echo "请运行以下命令安装 MongoDB:"
    echo "  brew tap mongodb/brew"
    echo "  brew install mongodb-community"
    echo ""
    echo "或者访问: https://www.mongodb.com/try/download/community"
    exit 1
fi

echo ""
echo "等待 MongoDB 启动..."
sleep 3

# 检查 MongoDB 是否运行
if pgrep -x mongod > /dev/null; then
    echo "✓ MongoDB 正在运行"
else
    echo "✗ MongoDB 启动失败"
    echo "请检查错误信息并手动启动 MongoDB"
fi

