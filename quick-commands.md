
# Quick Server Management Commands

## Application Management
```bash
# Check application status
pm2 status

# View application logs
pm2 logs noorcom-pos

# Restart application
pm2 restart noorcom-pos

# Stop application
pm2 stop noorcom-pos

# Deploy updates
./deploy-update.sh
```

## Server Management
```bash
# Check server resources
htop
df -h
free -m

# Check ports
netstat -tulpn | grep :8080

# Check Nginx status
systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

## Firebase Functions
```bash
# Deploy functions
firebase deploy --only functions

# View function logs
firebase functions:log
```

## URLs
- Application: http://159.89.169.200:8080
- Direct access (if Nginx proxy is down): http://159.89.169.200:8080

## Environment Files
- Production env: `.env.production`
- Firebase config: `firebase.json`
- PM2 config: `ecosystem.config.cjs`
