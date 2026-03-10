-- 1. Create a table to store roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'Data Entry',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin assigns an initial role manual via SQL, or the logic handles it.
-- Let's define the roles broadly: 'Admin', 'Accounting', 'Data Entry'

-- 2. Modify existing RLS policies so the team can collaborate on the same data
-- Note: This makes the application essentially single-tenant for your specific farm.
-- All members invited into this application can read and write the core logs.
-- If you need strict restrictions (e.g. Data Entry cannot edit Financials), we can apply those at the app level.

DROP POLICY IF EXISTS "Users can fully manage their own milk_logs" ON milk_logs;
CREATE POLICY "All authenticated users can manage milk_logs" ON milk_logs FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can fully manage their own livestock_logs" ON livestock_logs;
CREATE POLICY "All authenticated users can manage livestock_logs" ON livestock_logs FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can fully manage their own inventory_logs" ON inventory_logs;
CREATE POLICY "All authenticated users can manage inventory_logs" ON inventory_logs FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can fully manage their own accounting_transactions" ON accounting_transactions;
CREATE POLICY "All authenticated users can manage accounting_transactions" ON accounting_transactions FOR ALL USING (auth.uid() IS NOT NULL);
