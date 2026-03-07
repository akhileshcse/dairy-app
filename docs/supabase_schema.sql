-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Milk Logs Table
CREATE TABLE IF NOT EXISTS milk_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    source_destination TEXT,
    volume NUMERIC NOT NULL,
    fat NUMERIC,
    snf NUMERIC
);

-- 2. Livestock Logs Table 
CREATE TABLE IF NOT EXISTS livestock_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    cows_milking INT,
    cows_dry INT,
    cows_heifer INT,
    cows_calves INT,
    buffaloes_milking INT,
    buffaloes_dry INT,
    buffaloes_heifer INT,
    buffaloes_calves INT,
    animal_id TEXT,
    health_notes TEXT
);

-- 3. Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    feed_type TEXT,
    amount NUMERIC NOT NULL,
    notes TEXT
);

-- 4. Accounting Transactions Table (NEW)
CREATE TABLE IF NOT EXISTS accounting_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    type TEXT NOT NULL,
    category TEXT,
    amount NUMERIC NOT NULL,
    description TEXT
);

-- Turn on Row Level Security (Secure by default)
ALTER TABLE milk_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own records safely
CREATE POLICY "Users can fully manage their own milk_logs" ON milk_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can fully manage their own livestock_logs" ON livestock_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can fully manage their own inventory_logs" ON inventory_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can fully manage their own accounting_transactions" ON accounting_transactions FOR ALL USING (auth.uid() = user_id);

-- During initial development to skip immediate RLS blocks if Auth is missing, uncomment these lines:
-- CREATE POLICY "Allow public all on milk_logs" ON milk_logs FOR ALL USING (true);
-- CREATE POLICY "Allow public all on livestock_logs" ON livestock_logs FOR ALL USING (true);
-- CREATE POLICY "Allow public all on inventory_logs" ON inventory_logs FOR ALL USING (true);
-- CREATE POLICY "Allow public all on accounting_transactions" ON accounting_transactions FOR ALL USING (true);
