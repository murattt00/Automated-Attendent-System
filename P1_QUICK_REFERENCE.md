# P1 Quick Reference

## 🚀 Quick Commands

### Migrations

```bash
npm run migrate                  # Run all migrations
npm run migrate:status          # Check migration status
```

### Backup

```bash
./scripts/backup.sh             # Manual backup
RETENTION_DAYS=90 ./scripts/backup.sh  # Custom retention
```

### Testing

```bash
# Test analytics
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/analytics/teacher/summary

# Test enrollment
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"class_code":"CS101"}' http://localhost:3001/api/enrollment/enroll-by-code

# Test export
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/export/session/1/excel > attendance.xlsx
```

## 📋 Feature Flags

Enable/disable P1 features in `.env`:

```env
FEATURE_EMAIL_NOTIFICATIONS=true    # Enable email notifications
FEATURE_REPORTS_EXPORT=true         # Enable export functionality
FEATURE_ANALYTICS_DASHBOARD=true    # Enable analytics endpoints
```

## 🔗 Useful Links

- **P0 Features**: See `DEPLOYMENT_P0.md`
- **P1 Features**: See `DEPLOYMENT_P1.md`
- **API Documentation**: Coming soon...
- **Frontend Guide**: Coming soon...

## 📞 Support

Need help? Create an issue at: https://github.com/anthropics/claude-code/issues
