
#!/bin/bash

echo "🚀 Starting deployment of Noorcom POS..."

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart PM2 with ecosystem config
echo "🔄 Restarting application..."
pm2 delete noorcom-pos 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Your application is running at: http://159.89.169.200:8080"
echo "📊 Check status with: pm2 status"
echo "📝 View logs with: pm2 logs noorcom-pos"
