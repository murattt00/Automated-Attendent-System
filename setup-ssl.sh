#!/bin/bash

# ===========================================
# SSL Setup Script for University Attendance System
# ===========================================
# This script installs and configures SSL using Let's Encrypt
# Run this on your production server after domain is pointing to your server
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"
WEBROOT="/var/www/certbot"

echo -e "${GREEN}===========================================
SSL Setup for University Attendance System
===========================================${NC}\n"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root${NC}"
   exit 1
fi

# Prompt for domain and email
read -p "Enter your domain name (e.g., attendance.university.edu): " DOMAIN
read -p "Enter your email address for Let's Encrypt notifications: " EMAIL

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Domain and email are required${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}\n"

read -p "Continue with these settings? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted${NC}"
    exit 1
fi

# Update system
echo -e "\n${GREEN}[1/8] Updating system...${NC}"
apt-get update
apt-get upgrade -y

# Install Certbot
echo -e "\n${GREEN}[2/8] Installing Certbot...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo -e "\n${GREEN}[3/8] Installing Nginx...${NC}"
    apt-get install -y nginx
else
    echo -e "\n${GREEN}[3/8] Nginx already installed${NC}"
fi

# Create webroot directory for Let's Encrypt challenges
echo -e "\n${GREEN}[4/8] Creating webroot directory...${NC}"
mkdir -p $WEBROOT
chown -R www-data:www-data $WEBROOT

# Backup existing Nginx configuration
echo -e "\n${GREEN}[5/8] Backing up Nginx configuration...${NC}"
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S)
fi

# Create temporary Nginx configuration for Let's Encrypt challenge
echo -e "\n${GREEN}[6/8] Creating temporary Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/attendance-temp << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location ^~ /.well-known/acme-challenge/ {
        root $WEBROOT;
        default_type text/plain;
    }

    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site and restart Nginx
ln -sf /etc/nginx/sites-available/attendance-temp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Obtain SSL certificate
echo -e "\n${GREEN}[7/8] Obtaining SSL certificate from Let's Encrypt...${NC}"
certbot certonly \
    --webroot \
    --webroot-path=$WEBROOT \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

# Check if certificate was issued successfully
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}Error: Certificate was not issued. Please check DNS settings and try again.${NC}"
    exit 1
fi

# Deploy production Nginx configuration
echo -e "\n${GREEN}[8/8] Deploying production Nginx configuration...${NC}"

# Copy nginx.conf from project to /etc/nginx/sites-available/
if [ -f "/root/yoklama/nginx.conf" ]; then
    cp /root/yoklama/nginx.conf /etc/nginx/sites-available/attendance
    # Replace domain placeholders
    sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/attendance
elif [ -f "./nginx.conf" ]; then
    cp ./nginx.conf /etc/nginx/sites-available/attendance
    sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/attendance
else
    echo -e "${YELLOW}Warning: nginx.conf not found. Please manually configure Nginx.${NC}"
fi

# Create proxy_params_attendance file
cat > /etc/nginx/proxy_params_attendance << 'EOF'
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
proxy_http_version 1.1;
proxy_cache_bypass $http_upgrade;
proxy_redirect off;
proxy_buffering off;
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
EOF

# Enable production site
ln -sf /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/attendance-temp

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup automatic renewal
echo -e "\n${GREEN}Setting up automatic SSL renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -

# Test SSL certificate
echo -e "\n${GREEN}Testing SSL certificate...${NC}"
certbot certificates

# Configure firewall
echo -e "\n${GREEN}Configuring firewall...${NC}"
ufw allow 'Nginx Full'
ufw delete allow 'Nginx HTTP'

echo -e "\n${GREEN}===========================================
✅ SSL Setup Complete!
===========================================

Your SSL certificate has been installed successfully!

Certificate details:
- Domain: $DOMAIN
- Expires: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
- Auto-renewal: Enabled (runs twice daily)

Next steps:
1. Update your DNS records if not done already
2. Update frontend .env to use https://$DOMAIN
3. Update backend CORS settings for https://$DOMAIN
4. Test your site: https://$DOMAIN
5. Test SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN

Useful commands:
- Check certificate status: certbot certificates
- Renew manually: certbot renew
- Test renewal: certbot renew --dry-run
- Reload Nginx: systemctl reload nginx
- View Nginx logs: tail -f /var/log/nginx/attendance_error.log

${NC}"
