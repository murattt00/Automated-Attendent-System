#!/bin/bash

# ===========================================
# University Attendance System - Backup Script
# ===========================================
# This script performs automatic database backups
# and can be scheduled via cron
# ===========================================

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/attendance}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-university_attendance}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESS="${COMPRESS:-true}"
UPLOAD_TO_S3="${UPLOAD_TO_S3:-false}"
S3_BUCKET="${S3_BUCKET}"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")
BACKUP_FILE="attendance_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

echo -e "${GREEN}===========================================
University Attendance System - Backup
===========================================${NC}\n"

# Check if DB password is provided
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}Warning: DB_PASSWORD not set. Reading from .env file...${NC}"
    if [ -f ".env" ]; then
        export $(grep -v '^#' .env | xargs)
    else
        echo -e "${RED}Error: .env file not found and DB_PASSWORD not provided${NC}"
        exit 1
    fi
fi

# Create backup directory if it doesn't exist
echo -e "${YELLOW}[1/6] Creating backup directory...${NC}"
mkdir -p "${BACKUP_DIR}"
echo -e "${GREEN}✓ Backup directory: ${BACKUP_DIR}${NC}\n"

# Check if mysqldump is available
if ! command -v mysqldump &> /dev/null; then
    echo -e "${RED}Error: mysqldump not found. Please install mysql-client.${NC}"
    exit 1
fi

# Perform backup
echo -e "${YELLOW}[2/6] Creating database backup...${NC}"
mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    "${DB_NAME}" > "${BACKUP_PATH}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    echo -e "${GREEN}✓ Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})${NC}\n"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Compress backup
if [ "$COMPRESS" = "true" ]; then
    echo -e "${YELLOW}[3/6] Compressing backup...${NC}"
    gzip -f "${BACKUP_PATH}"
    BACKUP_PATH="${BACKUP_PATH}.gz"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed: ${BACKUP_FILE} (${COMPRESSED_SIZE})${NC}\n"
else
    echo -e "${YELLOW}[3/6] Skipping compression (COMPRESS=false)${NC}\n"
fi

# Upload to S3 (optional)
if [ "$UPLOAD_TO_S3" = "true" ]; then
    echo -e "${YELLOW}[4/6] Uploading to S3...${NC}"
    if command -v aws &> /dev/null; then
        aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/backups/${DATE}/${BACKUP_FILE}"
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Uploaded to S3: s3://${S3_BUCKET}/backups/${DATE}/${BACKUP_FILE}${NC}\n"
        else
            echo -e "${RED}✗ S3 upload failed${NC}\n"
        fi
    else
        echo -e "${RED}✗ AWS CLI not found. Skipping S3 upload.${NC}\n"
    fi
else
    echo -e "${YELLOW}[4/6] Skipping S3 upload (UPLOAD_TO_S3=false)${NC}\n"
fi

# Create backup manifest
echo -e "${YELLOW}[5/6] Creating backup manifest...${NC}"
MANIFEST_FILE="${BACKUP_DIR}/backup_manifest.txt"
echo "${TIMESTAMP}|${BACKUP_FILE}|$(stat -f%z "${BACKUP_PATH}" 2>/dev/null || stat -c%s "${BACKUP_PATH}")" >> "${MANIFEST_FILE}"
echo -e "${GREEN}✓ Manifest updated${NC}\n"

# Clean up old backups
echo -e "${YELLOW}[6/6] Cleaning up old backups (retention: ${RETENTION_DAYS} days)...${NC}"
find "${BACKUP_DIR}" -name "attendance_backup_*.sql*" -type f -mtime +${RETENTION_DAYS} -delete
OLD_COUNT=$(find "${BACKUP_DIR}" -name "attendance_backup_*.sql*" -type f | wc -l)
echo -e "${GREEN}✓ Old backups cleaned up. Remaining backups: ${OLD_COUNT}${NC}\n"

# Summary
echo -e "${GREEN}===========================================
Backup Summary
===========================================
Date: $(date)
Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}
Backup File: ${BACKUP_FILE}
Backup Path: ${BACKUP_PATH}
Size: ${COMPRESSED_SIZE:-${BACKUP_SIZE}}
Retention: ${RETENTION_DAYS} days
S3 Upload: ${UPLOAD_TO_S3}
===========================================
✅ Backup completed successfully!
===========================================${NC}\n"

# Exit successfully
exit 0
