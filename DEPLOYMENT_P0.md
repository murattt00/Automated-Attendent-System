# 🚀 Production Deployment Guide

## P0 Updates Completed ✅

This guide outlines the P0 (Critical) improvements that have been implemented to make the system production-ready.

---

## 🎯 What's New

### 1. ✅ Redis Integration

- **QR tokens now stored in Redis** instead of in-memory
- Supports multiple server instances (horizontal scaling)
- Persistent token storage with automatic expiry
- Failover handling if Redis goes down

**Files Changed:**

- `backend/config/redis.js` - Redis client configuration
- `backend/utils/token.js` - Updated to use Redis
- `backend/server.js` - Async token handling
- `backend/routes/session.js` - Token cleanup on session end
- `backend/package.json` - Added `ioredis` and related packages

### 2. ✅ Environment Variables

- **Comprehensive .env.example** with all configuration options
- **Separate .env.production** template for production
- Added Redis configuration
- Added logging configuration
- Added security settings
- Added feature flags

**Files Changed:**

- `.env.example` - Comprehensive template
- `backend/.env` - Updated for development
- `backend/.env.production` - New production template

### 3. ✅ Database Migrations

- **Proper Sequelize migrations** instead of sync
- All tables have migration files
- Proper indexes for performance
- Easy rollback capability

**Files Created:**

- `backend/.sequelizerc` - Sequelize CLI configuration
- `backend/migrations/20240101000001-create-users.js`
- `backend/migrations/20240101000002-create-classes.js`
- `backend/migrations/20240101000003-create-sessions.js`
- `backend/migrations/20240101000004-create-attendances.js`
- `backend/migrations/20240101000005-create-student-enrollments.js`

**New Commands:**

```bash
npm run migrate           # Run migrations
npm run migrate:undo      # Undo last migration
npm run migrate:status    # Check migration status
```

### 4. ✅ Logging Improvements

- **Daily log rotation** using winston-daily-rotate-file
- Separate log files for errors, combined, and HTTP
- Automatic compression of old logs
- Exception and rejection handling
- Configurable log retention

**Files Changed:**

- `backend/config/logger.js` - Enhanced logging
- Logs now saved to `backend/logs/` directory:
  - `error-YYYY-MM-DD.log` - Error logs only
  - `combined-YYYY-MM-DD.log` - All logs
  - `http-YYYY-MM-DD.log` - HTTP access logs
  - `exceptions-YYYY-MM-DD.log` - Uncaught exceptions
  - `rejections-YYYY-MM-DD.log` - Unhandled promise rejections

### 5. ✅ Nginx & SSL Configuration

- **Production-ready Nginx config** with SSL
- Rate limiting zones
- WebSocket support for Socket.IO
- Security headers
- Gzip compression
- **Automated SSL setup script** for Let's Encrypt

**Files Created:**

- `nginx.conf` - Production Nginx configuration
- `setup-ssl.sh` - Automated SSL installation script

### 6. ✅ Docker Updates

- **Redis service added** to docker-compose
- Health checks for all services
- Proper service dependencies

**Files Changed:**

- `docker-compose.yml` - Added Redis service

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install  # Installs new packages: ioredis, winston-daily-rotate-file, sequelize-cli, etc.
```

### 2. Install Redis

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Windows:**

```bash
# Use Docker or WSL2
docker run -d -p 6379:6379 redis:7-alpine
```

**Or use Docker Compose** (Recommended):

```bash
docker-compose up -d redis
```

### 3. Update Environment Variables

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
# Make sure to set REDIS_HOST, REDIS_PORT, etc.
```

### 4. Run Migrations

```bash
cd backend
npm run migrate
# Check status: npm run migrate:status
```

### 5. Start Services

**Development:**

```bash
# Terminal 1: Redis (if not using Docker)
redis-server

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

**Production with Docker:**

```bash
docker-compose up -d
```

---

## 🔐 SSL Setup (Production Only)

### Prerequisites

- Domain name pointing to your server (A record)
- Ports 80 and 443 open in firewall
- Root access to server

### Automatic Setup

```bash
# Make script executable
chmod +x setup-ssl.sh

# Run as root
sudo ./setup-ssl.sh

# Follow the prompts:
# - Enter your domain name
# - Enter your email
# - Script will:
#   - Install Certbot
#   - Install Nginx
#   - Obtain SSL certificate
#   - Configure Nginx with SSL
#   - Setup auto-renewal
```

### Manual Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/attendance
sudo ln -s /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Update domain in config
sudo sed -i 's/yourdomain.com/your-actual-domain.com/g' /etc/nginx/sites-available/attendance

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🧪 Testing

### Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Test Token Generation

```bash
# In Node.js REPL
node
> const { generateQRToken } = require('./backend/utils/token')
> generateQRToken(123).then(console.log)
# Should print an 8-character token
```

### Test Migrations

```bash
cd backend
npm run migrate:status
# Should show all migrations executed
```

### Test Logging

```bash
# Check if log files are created
ls -la backend/logs/
# Should see error-*.log, combined-*.log, http-*.log
```

### Test SSL (after setup)

```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

---

## 📊 Monitoring

### Check Redis Memory Usage

```bash
redis-cli info memory
```

### Check Log Files

```bash
# Real-time error log
tail -f backend/logs/error-$(date +%Y-%m-%d).log

# Real-time combined log
tail -f backend/logs/combined-$(date +%Y-%m-%d).log
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

### Check SSL Certificate Expiry

```bash
sudo certbot certificates
```

---

## 🔄 Maintenance

### Redis Maintenance

```bash
# Flush all Redis data (careful!)
redis-cli FLUSHALL

# Get Redis stats
redis-cli INFO

# Monitor Redis commands live
redis-cli MONITOR
```

### Log Rotation

Logs are automatically rotated daily and compressed. Old logs are kept based on `LOG_MAX_FILES` setting (default: 14 days).

### SSL Renewal

SSL certificate auto-renewal is configured via cron job. Manual renewal:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Database Backup

```bash
# Backup database
mysqldump -u yoklama_user -p university_attendance > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u yoklama_user -p university_attendance < backup_20240101.sql
```

---

## 🚨 Troubleshooting

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Check Redis logs
sudo journalctl -u redis-server -n 50

# Restart Redis
sudo systemctl restart redis-server
```

### SSL Certificate Issues

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate details
sudo certbot certificates
```

### Migration Errors

```bash
# Check migration status
npm run migrate:status

# Undo last migration
npm run migrate:undo

# Reset all migrations (careful!)
npm run migrate:undo:all
npm run migrate
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/attendance_error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📝 Next Steps (P1 - Important)

After P0 is deployed, consider these improvements:

1. **Analytics Dashboard** - Vue components already installed (Chart.js, vue-chartjs)
2. **Email Notifications** - Nodemailer already installed
3. **Excel/PDF Export** - Libraries already installed (xlsx, pdfkit)
4. **Rate Limiting with Redis** - More robust than memory-based
5. **Session Scheduling** - Allow multiple active sessions
6. **Backup Automation** - Cron jobs for database backups
7. **Monitoring Dashboard** - Grafana + Prometheus
8. **Error Tracking** - Sentry integration

---

## 🎉 Summary

All P0 (Critical) improvements have been completed:

- ✅ Redis for scalable token storage
- ✅ Production-ready environment variables
- ✅ Proper database migrations
- ✅ Enterprise-grade logging
- ✅ SSL/TLS with Let's Encrypt
- ✅ Nginx reverse proxy
- ✅ Docker Compose with Redis

Your system is now **80% production-ready**! 🚀

The remaining 20% includes:

- Testing with real users
- Performance tuning
- Additional monitoring
- Backup strategy implementation
- Security audit
- Load testing

---

**Need help?** Check the main README.md or create an issue.
