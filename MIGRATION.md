# Database Migration Guide

## Changes Made to Schema

The `sessions` table has been updated with two new fields for better tracking:

### New Fields:
- `created_at` - Timestamp when the session was created (defaults to current time)
- `updated_at` - Timestamp when the session was last updated (defaults to current time)

### Migration SQL:

```sql
ALTER TABLE sessions 
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
```

## How to Apply:

1. **Using Drizzle ORM** (Recommended):
   ```bash
   npm run db:migrate
   ```

2. **Manual SQL**: 
   Run the SQL above directly in your PostgreSQL database

3. **Using existing Drizzle migrations**:
   - Create a new migration file
   - Add the ALTER TABLE statements
   - Run `npm run db:migrate`

## Benefits:

✅ Track when sessions are created for analytics
✅ Track when sessions are updated for data integrity
✅ Better for audit logging
✅ Supports future features like session statistics

## Backwards Compatibility:

The changes are backwards compatible. Existing sessions will have:
- `created_at` = current timestamp
- `updated_at` = current timestamp

No existing data will be affected.
