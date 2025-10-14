# Database Migration Guide

## Apply the Analytics & Profile Migration

The platform shows zeros because the database migration hasn't been applied yet. Follow these steps:

### Step 1: Go to Supabase SQL Editor

1. Open your browser and go to: https://supabase.com/dashboard/project/vbpepgysyzrllyegzety
2. Log in to your Supabase account
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy and Paste the Migration SQL

Copy the ENTIRE contents from the file:
```
supabase/migrations/20251013000000_add_analytics_tracking.sql
```

Or copy from below (scroll down to see the full SQL)

### Step 3: Run the Migration

1. Paste the SQL into the query editor
2. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
3. Wait for the success message

### Step 4: Verify the Migration

After running the migration, verify it worked by:

1. Go to **"Table Editor"** in Supabase
2. Check that these tables exist:
   - `site_visitors` (new table)
   - `site_statistics` (new table)
3. Click on the `profiles` table
4. Verify these columns exist:
   - `avatar_url` (should be a new column)
   - `bio` (should be a new column)

### Step 5: Test the Functions

In SQL Editor, run this query to test:

```sql
SELECT get_platform_stats();
```

You should see a JSON response with stats like:
```json
{
  "total_visitors": 0,
  "total_products": 1,
  "total_shops": 0,
  "total_reviews": 0,
  "total_users": 1
}
```

### Step 6: Refresh Your Website

1. Go back to your deployed website
2. Refresh the page (Ctrl+R / Cmd+R)
3. The statistics should now show real numbers!
4. Browse around - you should see visitor count increase
5. Try editing your profile - it should work now!

## What This Migration Does

1. **Adds Profile Fields**
   - `avatar_url` - for user profile pictures
   - `bio` - for user biography

2. **Creates Analytics Tables**
   - `site_visitors` - tracks each visitor session
   - `site_statistics` - stores aggregated stats

3. **Creates Functions**
   - `get_platform_stats()` - returns real-time counts
   - `record_visit()` - records page visits

4. **Sets Up Security**
   - Anyone can record visits
   - Only admins can view visitor data
   - Proper Row Level Security (RLS) policies

## Troubleshooting

### Still showing zeros?

1. Make sure the migration ran successfully (no error messages)
2. Check the browser console for errors (F12 → Console tab)
3. Verify your product status is 'active' (not 'discontinued' or 'upcoming')

### Profile update still failing?

1. Check that the `bio` and `avatar_url` columns were added to `profiles` table
2. In Supabase, go to Table Editor → profiles → verify the columns exist
3. If not, run this SQL manually:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
```

### Products not showing in count?

Products are only counted if their `status` = 'active'. Check your products:

```sql
SELECT id, name, status FROM products;
```

If status is not 'active', update it:

```sql
UPDATE products SET status = 'active' WHERE id = 'your-product-id';
```

## Need Help?

If you encounter any issues, check:
1. The SQL Editor for error messages
2. Your browser console (F12) for JavaScript errors
3. That you're logged in as an admin user
