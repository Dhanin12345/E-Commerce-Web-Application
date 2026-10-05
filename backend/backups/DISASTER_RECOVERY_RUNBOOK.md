# SMARTCART DISASTER RECOVERY & CONTINUITY PLAN

Last Verified Snapshot: 2026-09-28T20:00:07.033159

## 1. Backup Strategy
- **Database Backup Frequency**: Hourly automated snapshots with WAL archiving.
- **Retention Policy**: 7 daily snapshots, 4 weekly snapshots, 12 monthly archives.
- **Media Assets**: Mirrored to dual-region Object Storage (AWS S3 / GCP Cloud Storage).

## 2. Restore Procedure (RTO < 15 mins, RPO < 5 mins)
1. Stop API server workers: `systemctl stop smartcart-api`
2. Validate snapshot checksum: `sha256sum db_backup_20260928_200007.sqlite3`
3. Restore database snapshot into production path.
4. Run schema integrity check: `python manage.py migrate --check`
5. Restart API and verify health check: `curl -f http://127.0.0.1:8000/api/health/`
