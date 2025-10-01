#!/bin/bash

# MongoDB Setup Script for Weather One Community Feature
# This script helps set up a local MongoDB instance for development

echo "🌦️  Weather One - MongoDB Setup"
echo "================================="
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB is not installed on your system."
    echo ""
    echo "Please install MongoDB first:"
    echo "📦 Ubuntu/Debian: sudo apt install mongodb"
    echo "📦 macOS: brew install mongodb/brew/mongodb-community"
    echo "📦 Or use MongoDB Atlas (cloud): https://cloud.mongodb.com/"
    echo ""
    exit 1
fi

echo "✅ MongoDB is installed"

# Check if MongoDB service is running
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB service is already running"
else
    echo "🚀 Starting MongoDB service..."
    
    # Try different ways to start MongoDB based on the system
    if command -v brew &> /dev/null; then
        # macOS with Homebrew
        brew services start mongodb/brew/mongodb-community
    elif command -v systemctl &> /dev/null; then
        # Linux with systemd
        sudo systemctl start mongod
    else
        # Fallback: try to start mongod directly
        mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ MongoDB service started successfully"
    else
        echo "❌ Failed to start MongoDB service"
        echo "Please start MongoDB manually or use MongoDB Atlas"
        exit 1
    fi
fi

# Test connection
echo "🔗 Testing MongoDB connection..."
if mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ Failed to connect to MongoDB"
    echo "Please check your MongoDB installation"
    exit 1
fi

# Create database and collection if they don't exist
echo "📊 Setting up Weather One database..."
mongosh weatherone --eval "
    db.community_posts.createIndex({ createdAt: -1 });
    db.community_posts.createIndex({ approved: 1 });
    print('✅ Database and indexes created');
" > /dev/null 2>&1

echo ""
echo "🎉 MongoDB setup complete!"
echo ""
echo "Your MongoDB is ready for Weather One community posts."
echo "Database: weatherone"
echo "Collection: community_posts"
echo ""
echo "Next steps:"
echo "1. Make sure your .env.local contains: MONGODB_URI=mongodb://localhost:27017/weatherone"
echo "2. Run: pnpm dev"
echo "3. Visit: http://localhost:3000/community"
echo ""