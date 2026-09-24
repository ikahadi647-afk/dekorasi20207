-- =====================================================
-- ROLLBACK SCRIPT FOR WEDDFIN DATABASE MIGRATION
-- =====================================================
-- WARNING: This script will DROP all tables and their data!
-- Only use this if migration failed and you need to start over.
--
-- Usage:
--   psql "CONNECTION_STRING" -f migration/rollback_migration.sql
--
-- This will:
-- 1. Disable RLS on all tables
-- 2. Drop all tables in correct order (respecting foreign keys)
-- 3. Clean up any remaining objects
-- =====================================================

-- Disable RLS first to avoid permission issues
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS promo_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS add_ons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS galleries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pockets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_add_ons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_team_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_payment_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_project_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendor_portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS wedding_day_checklists DISABLE ROW LEVEL SECURITY;

-- Drop policies (in case they exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "Users can read own data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own data" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read own profile" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can insert own profile" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read clients" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create clients" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update clients" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete clients" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read projects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create projects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update projects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete projects" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read team members" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create team members" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update team members" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete team members" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read leads" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create leads" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update leads" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete leads" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read calendar events" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create calendar events" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update calendar events" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete calendar events" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read packages" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage packages" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read add-ons" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage add-ons" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read promo codes" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage promo codes" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read bookings" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create bookings" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update bookings" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete bookings" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read transactions" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create transactions" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update transactions" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read pockets" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage pockets" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can read own notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "System can create notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own notifications" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read contracts" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage contracts" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read galleries" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage galleries" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read feedback" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage feedback" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read cards" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage cards" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read project add-ons" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage project add-ons" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read team assignments" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage team assignments" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read team project payments" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage team project payments" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read payment records" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage payment records" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read vendor profiles" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage vendor profiles" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Public can read vendor portfolios" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage vendor portfolios" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can read checklists" ON ' || quote_ident(r.tablename);
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can manage checklists" ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Drop tables in order (child tables first to respect foreign keys)
DROP TABLE IF EXISTS wedding_day_checklists CASCADE;
DROP TABLE IF EXISTS vendor_portfolios CASCADE;
DROP TABLE IF EXISTS vendor_profiles CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS team_project_payments CASCADE;
DROP TABLE IF EXISTS team_payment_records CASCADE;
DROP TABLE IF EXISTS project_team_assignments CASCADE;
DROP TABLE IF EXISTS project_add_ons CASCADE;
DROP TABLE IF EXISTS pockets CASCADE;
DROP TABLE IF EXISTS galleries CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS client_feedback CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Clean up any remaining sequences
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS profiles_id_seq CASCADE;
DROP SEQUENCE IF EXISTS clients_id_seq CASCADE;
DROP SEQUENCE IF EXISTS projects_id_seq CASCADE;
DROP SEQUENCE IF EXISTS team_members_id_seq CASCADE;
DROP SEQUENCE IF EXISTS leads_id_seq CASCADE;
DROP SEQUENCE IF EXISTS calendar_events_id_seq CASCADE;
DROP SEQUENCE IF EXISTS packages_id_seq CASCADE;
DROP SEQUENCE IF EXISTS promo_codes_id_seq CASCADE;
DROP SEQUENCE IF EXISTS notifications_id_seq CASCADE;
DROP SEQUENCE IF EXISTS add_ons_id_seq CASCADE;
DROP SEQUENCE IF EXISTS bookings_id_seq CASCADE;
DROP SEQUENCE IF EXISTS cards_id_seq CASCADE;
DROP SEQUENCE IF EXISTS client_feedback_id_seq CASCADE;
DROP SEQUENCE IF EXISTS contracts_id_seq CASCADE;
DROP SEQUENCE IF EXISTS galleries_id_seq CASCADE;
DROP SEQUENCE IF EXISTS pockets_id_seq CASCADE;
DROP SEQUENCE IF EXISTS project_add_ons_id_seq CASCADE;
DROP SEQUENCE IF EXISTS project_team_assignments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS team_payment_records_id_seq CASCADE;
DROP SEQUENCE IF EXISTS team_project_payments_id_seq CASCADE;
DROP SEQUENCE IF EXISTS transactions_id_seq CASCADE;
DROP SEQUENCE IF EXISTS vendor_portfolios_id_seq CASCADE;
DROP SEQUENCE IF EXISTS vendor_profiles_id_seq CASCADE;
DROP SEQUENCE IF EXISTS wedding_day_checklists_id_seq CASCADE;

-- Verify cleanup
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        'users', 'profiles', 'clients', 'projects', 'team_members',
        'leads', 'calendar_events', 'packages', 'promo_codes',
        'notifications', 'add_ons', 'bookings', 'cards',
        'client_feedback', 'contracts', 'galleries', 'pockets',
        'project_add_ons', 'project_team_assignments',
        'team_payment_records', 'team_project_payments',
        'transactions', 'vendor_portfolios', 'vendor_profiles',
        'wedding_day_checklists'
    );
    
    IF table_count = 0 THEN
        RAISE NOTICE 'Rollback completed successfully. All tables dropped.';
    ELSE
        RAISE WARNING 'Rollback incomplete. % tables still exist.', table_count;
    END IF;
END $$;

-- =====================================================
-- ROLLBACK COMPLETE
-- =====================================================
-- You can now re-run the migration:
-- 1. psql "CONNECTION_STRING" -f migration/007_schema_from_backup.sql
-- 2. psql "CONNECTION_STRING" -f migration/008_data_from_backup.sql
-- 3. psql "CONNECTION_STRING" -f migration/009_rls_policies.sql
-- =====================================================
