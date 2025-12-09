# Quick Setup Guide - User Accounts in Account Table

## Problem
User accounts aren't being created in the Account table when users sign up.

## Solution (Choose ONE of these approaches)

### Option 1: Set Up Database Triggers (Recommended)

This makes Account records create automatically for all new signups.

1. Go to Supabase SQL Editor
2. Copy and paste the entire `supabase-role-migration.sql` file
3. Click "Run"

**This sets up:**
- Automatic Account creation via database triggers
- User roles (user/admin)
- Row-level security policies

### Option 2: Fix Existing Users Only

If you just need to fix users that already signed up:

1. Go to Supabase SQL Editor
2. Copy and paste the `fix-existing-users.sql` file
3. Click "Run"

**Note:** New users signing up will still create Account records thanks to the fallback code in the signup page.

## Verify It's Working

Run this in Supabase SQL Editor:

```sql
-- Check if Account records exist for all users
SELECT
    COUNT(DISTINCT u.id) as total_auth_users,
    COUNT(DISTINCT a.id) as total_account_records,
    COUNT(DISTINCT u.id) - COUNT(DISTINCT a.id) as missing_accounts
FROM auth.users u
LEFT JOIN public."Account" a ON u.id = a.id;
```

If `missing_accounts` is 0, you're all set!

## Make Yourself an Admin

After setup, run this to make yourself an admin:

```sql
UPDATE public."Account"
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Then log out and log back in to see the Admin button.

## Need More Help?

See the full guide: [SETUP-ADMIN-ROLES.md](SETUP-ADMIN-ROLES.md)
