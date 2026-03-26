#!/bin/bash

# ===========================================
# University Attendance System - Restore Script
# ===========================================
# This script restores database from backup
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

echo -e "${GREEN}===========================================
University Attendance System - Restore
===========================================${NC}\n"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo -e "${YELLOW}Usage: $0 <backup_file>${NC}"
    echo -e "${YELLOW}Example: $0 attendance_backup_20240101_120000.sql.gz${NC}\n"

    # List available backups
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh "${BACKUP_DIR}"/attendance_backup_*.sql* 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    if [ ! -f "${BACKUP_FILE}" ]; then
        echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
        exit 1
    fi
    BACKUP_PATH="${BACKUP_FILE}"
else
    BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
fi

echo -e "${YELLOW}Backup file: ${BACKUP_PATH}${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}${NC}\n"

# Confirmation
echo -e "${RED}⚠️  WARNING: This will OVERWRITE the current database!${NC}"
read -p "Are you sure you want to restore? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

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

# Create safety backup before restore
echo -e "${YELLOW}[1/4] Creating safety backup of current database...${NC}"
SAFETY_BACKUP="${BACKUP_DIR}/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}" \
    --single-transaction \
    "${DB_NAME}" > "${SAFETY_BACKUP}"
gzip -f "${SAFETY_BACKUP}"
echo -e "${GREEN}✓ Safety backup created: ${SAFETY_BACKUP}.gz${NC}\n"

# Decompress if needed
RESTORE_FILE="${BACKUP_PATH}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}[2/4] Decompressing backup...${NC}"
    RESTORE_FILE="${BACKUP_PATH%.gz}"
    gunzip -c "${BACKUP_PATH}" > "${RESTORE_FILE}"
    echo -e "${GREEN}✓ Backup decompressed${NC}\n"
else
    echo -e "${YELLOW}[2/4] Backup is not compressed, using directly${NC}\n"
fi

# Restore database
echo -e "${YELLOW}[3/4] Restoring database...${NC}"
mysql \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --user="${DB_USER}" \
    --password="${DB_PASSWORD}" \
    "${DB_NAME}" < "${RESTORE_FILE}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}\n"
else
    echo -e "${RED}✗ Restore failed!${NC}"
    echo -e "${YELLOW}You can restore from safety backup: ${SAFETY_BACKUP}.gz${NC}"
    exit 1
fi

# Clean up temporary decompressed file
if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "${RESTORE_FILE}" ]; then
    echo -e "${YELLOW}[4/4] Cleaning up temporary files...${NC}"
    rm -f "${RESTORE_FILE}"
    echo -e "${GREEN}✓ Cleanup completed${NC}\n"
else
    echo -e "${YELLOW}[4/4] No cleanup needed${NC}\n"
fi

# Summary
echo -e "${GREEN}===========================================
Restore Summary
===========================================
Date: $(date)
Database: ${DB_NAME}@${DB_HOST}:${DB_PORT}
Backup File: ${BACKUP_FILE}
Safety Backup: ${SAFETY_BACKUP}.gz
===========================================
✅ Restore completed successfully!
===========================================${NC}\n"

exit 0
