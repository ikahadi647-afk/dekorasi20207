-- =====================================================
-- RLS POLICIES FOR WEDDFIN DASHBOARD
-- =====================================================
-- This file contains Row Level Security policies that need to be
-- applied after schema and data migration is complete.
--
-- Order of execution:
-- 1. 007_schema_from_backup.sql (tables)
-- 2. 008_data_from_backup.sql (data)
-- 3. 009_rls_policies.sql (this file)
--
-- Run: psql "CONNECTION_STRING" -f migration/009_rls_policies.sql
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_day_checklists ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS & PROFILES
-- =====================================================

-- Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Profiles: Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Profiles: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Profiles: Allow insert for new users
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CLIENTS
-- =====================================================

-- Authenticated users can read all clients
CREATE POLICY "Authenticated users can read clients"
ON clients FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create clients
CREATE POLICY "Authenticated users can create clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update clients
CREATE POLICY "Authenticated users can update clients"
ON clients FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete clients
CREATE POLICY "Authenticated users can delete clients"
ON clients FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- PROJECTS
-- =====================================================

-- Authenticated users can read all projects
CREATE POLICY "Authenticated users can read projects"
ON projects FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update projects
CREATE POLICY "Authenticated users can update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete projects
CREATE POLICY "Authenticated users can delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- TEAM MEMBERS
-- =====================================================

-- Authenticated users can read all team members
CREATE POLICY "Authenticated users can read team members"
ON team_members FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create team members
CREATE POLICY "Authenticated users can create team members"
ON team_members FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update team members
CREATE POLICY "Authenticated users can update team members"
ON team_members FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete team members
CREATE POLICY "Authenticated users can delete team members"
ON team_members FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- LEADS
-- =====================================================

-- Authenticated users can read all leads
CREATE POLICY "Authenticated users can read leads"
ON leads FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create leads
CREATE POLICY "Authenticated users can create leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update leads
CREATE POLICY "Authenticated users can update leads"
ON leads FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete leads
CREATE POLICY "Authenticated users can delete leads"
ON leads FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- CALENDAR EVENTS
-- =====================================================

-- Authenticated users can read all events
CREATE POLICY "Authenticated users can read calendar events"
ON calendar_events FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create calendar events"
ON calendar_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update events
CREATE POLICY "Authenticated users can update calendar events"
ON calendar_events FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete events
CREATE POLICY "Authenticated users can delete calendar events"
ON calendar_events FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- PACKAGES & ADD-ONS
-- =====================================================

-- Anyone can read packages (public)
CREATE POLICY "Public can read packages"
ON packages FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage packages
CREATE POLICY "Authenticated users can manage packages"
ON packages FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anyone can read add-ons (public)
CREATE POLICY "Public can read add-ons"
ON add_ons FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage add-ons
CREATE POLICY "Authenticated users can manage add-ons"
ON add_ons FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- PROMO CODES
-- =====================================================

-- Authenticated users can read promo codes
CREATE POLICY "Authenticated users can read promo codes"
ON promo_codes FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage promo codes
CREATE POLICY "Authenticated users can manage promo codes"
ON promo_codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- BOOKINGS
-- =====================================================

-- Authenticated users can read all bookings
CREATE POLICY "Authenticated users can read bookings"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create bookings
CREATE POLICY "Authenticated users can create bookings"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update bookings
CREATE POLICY "Authenticated users can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can delete bookings
CREATE POLICY "Authenticated users can delete bookings"
ON bookings FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- TRANSACTIONS & POCKETS
-- =====================================================

-- Authenticated users can read all transactions
CREATE POLICY "Authenticated users can read transactions"
ON transactions FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create transactions
CREATE POLICY "Authenticated users can create transactions"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update transactions
CREATE POLICY "Authenticated users can update transactions"
ON transactions FOR UPDATE
TO authenticated
USING (true);

-- Authenticated users can read all pockets
CREATE POLICY "Authenticated users can read pockets"
ON pockets FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage pockets
CREATE POLICY "Authenticated users can manage pockets"
ON pockets FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- CONTRACTS
-- =====================================================

-- Authenticated users can read all contracts
CREATE POLICY "Authenticated users can read contracts"
ON contracts FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage contracts
CREATE POLICY "Authenticated users can manage contracts"
ON contracts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- GALLERIES
-- =====================================================

-- Anyone can read public galleries
CREATE POLICY "Public can read galleries"
ON galleries FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage galleries
CREATE POLICY "Authenticated users can manage galleries"
ON galleries FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- CLIENT FEEDBACK
-- =====================================================

-- Authenticated users can read all feedback
CREATE POLICY "Authenticated users can read feedback"
ON client_feedback FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage feedback
CREATE POLICY "Authenticated users can manage feedback"
ON client_feedback FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- CARDS (Wedding Invitation Cards)
-- =====================================================

-- Anyone can read cards (public)
CREATE POLICY "Public can read cards"
ON cards FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage cards
CREATE POLICY "Authenticated users can manage cards"
ON cards FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- PROJECT ADD-ONS
-- =====================================================

-- Authenticated users can read project add-ons
CREATE POLICY "Authenticated users can read project add-ons"
ON project_add_ons FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage project add-ons
CREATE POLICY "Authenticated users can manage project add-ons"
ON project_add_ons FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- PROJECT TEAM ASSIGNMENTS
-- =====================================================

-- Authenticated users can read team assignments
CREATE POLICY "Authenticated users can read team assignments"
ON project_team_assignments FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage team assignments
CREATE POLICY "Authenticated users can manage team assignments"
ON project_team_assignments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- TEAM PAYMENTS
-- =====================================================

-- Authenticated users can read team payments
CREATE POLICY "Authenticated users can read team project payments"
ON team_project_payments FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage team payments
CREATE POLICY "Authenticated users can manage team project payments"
ON team_project_payments FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can read payment records
CREATE POLICY "Authenticated users can read payment records"
ON team_payment_records FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage payment records
CREATE POLICY "Authenticated users can manage payment records"
ON team_payment_records FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- VENDOR PROFILES & PORTFOLIOS
-- =====================================================

-- Anyone can read vendor profiles (public)
CREATE POLICY "Public can read vendor profiles"
ON vendor_profiles FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage vendor profiles
CREATE POLICY "Authenticated users can manage vendor profiles"
ON vendor_profiles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Anyone can read vendor portfolios (public)
CREATE POLICY "Public can read vendor portfolios"
ON vendor_portfolios FOR SELECT
TO authenticated, anon
USING (true);

-- Authenticated users can manage vendor portfolios
CREATE POLICY "Authenticated users can manage vendor portfolios"
ON vendor_portfolios FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- WEDDING DAY CHECKLISTS
-- =====================================================

-- Authenticated users can read checklists
CREATE POLICY "Authenticated users can read checklists"
ON wedding_day_checklists FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage checklists
CREATE POLICY "Authenticated users can manage checklists"
ON wedding_day_checklists FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =====================================================
-- END OF RLS POLICIES
-- =====================================================
