#!/bin/bash

echo "=========================================="
echo "启动 MongoDB - 自动检测和安装"
echo "=========================================="
echo ""

# 检查 MongoDB 是否已安装
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB 已安装"
    
    # 检查是否在运行
    if pgrep -x mongod > /dev/null; then
        echo "✓ MongoDB 正在运行"
        exit 0
    else
        echo "启动 MongoDB..."
        # 尝试使用 brew services
        if command -v brew &> /dev/null; then
            brew services start mongodb-community 2>&1
            sleep 3
            if pgrep -x mongod > /dev/null; then
                echo "✓ MongoDB 已启动"
                exit 0
            fi
        fi
        
        # 尝试直接运行
        echo "尝试直接运行 mongod..."
        mkdir -p ~/data/db
        mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongod.log 2>&1
        sleep 2
        if pgrep -x mongod > /dev/null; then
            echo "✓ MongoDB 已启动"
            exit 0
        else
            echo "✗ MongoDB 启动失败"
            exit 1
        fi
    fi
else
    echo "✗ MongoDB 未安装"
    echo ""
    echo "开始安装 MongoDB..."
    echo ""
    
    # 检查 Homebrew
    if ! command -v brew &> /dev/null; then
        echo "✗ Homebrew 未安装"
        echo "请先安装 Homebrew: https://brew.sh"
        exit 1
    fi
    
    # 添加 MongoDB tap
    echo "步骤 1: 添加 MongoDB tap..."
    brew tap mongodb/brew
    
    # 尝试安装
    echo "步骤 2: 安装 MongoDB..."
    if brew install mongodb-community 2>&1; then
        echo "✓ MongoDB 安装成功"
        echo ""
        echo "启动 MongoDB..."
        brew services start mongodb-community
        sleep 3
        if pgrep -x mongod > /dev/null; then
            echo "✓ MongoDB 已启动"
            exit 0
        else
            echo "✗ MongoDB 启动失败，请手动运行: brew services start mongodb-community"
            exit 1
        fi
    else
        echo "✗ MongoDB 安装失败"
        echo ""
        echo "可能的原因："
        echo "1. 命令行工具版本过旧"
        echo "2. 需要更新命令行工具"
        echo ""
        echo "解决方法："
        echo "运行以下命令更新命令行工具："
        echo "  sudo rm -rf /Library/Developer/CommandLineTools"
        echo "  sudo xcode-select --install"
        echo ""
        echo "或者使用 MongoDB Atlas 云数据库（推荐，无需安装）："
        echo "1. 访问: https://www.mongodb.com/cloud/atlas/register"
        echo "2. 注册免费账号并创建集群"
        echo "3. 获取连接字符串"
        echo "4. 在项目根目录创建 .env 文件，添加: MONGODB_URI=你的连接字符串"
        exit 1
    fi
fi

