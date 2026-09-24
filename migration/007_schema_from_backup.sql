-- ============================================
-- SCHEMA GENERATED FROM BACKUP
-- Generated: 2026-09-24T14:35:27.363Z
-- Source: BACKUP_SUPABASE/backup_2026-09-24T14-30-16
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: add_ons
CREATE TABLE IF NOT EXISTS public.add_ons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    region TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: cards
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    card_type TEXT NOT NULL,
    last_four_digits TEXT NOT NULL,
    expiry_date TEXT,
    balance INTEGER NOT NULL,
    color_gradient TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: packages
CREATE TABLE IF NOT EXISTS public.packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    physical_items JSONB NOT NULL DEFAULT '[]',
    digital_items JSONB NOT NULL DEFAULT '[]',
    processing_time TEXT NOT NULL,
    default_printing_cost INTEGER NOT NULL DEFAULT 0,
    default_transport_cost INTEGER NOT NULL DEFAULT 0,
    photographers TEXT NOT NULL,
    videographers TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    duration_options JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    company_name TEXT NOT NULL,
    website TEXT,
    instagram TEXT,
    address TEXT NOT NULL,
    bank_account TEXT NOT NULL,
    authorized_signer TEXT NOT NULL,
    id_number TEXT,
    bio TEXT,
    income_categories JSONB NOT NULL DEFAULT '[]',
    expense_categories JSONB NOT NULL DEFAULT '[]',
    project_types JSONB NOT NULL DEFAULT '[]',
    event_types JSONB NOT NULL DEFAULT '[]',
    asset_categories JSONB NOT NULL DEFAULT '[]',
    sop_categories JSONB NOT NULL DEFAULT '[]',
    package_categories JSONB NOT NULL DEFAULT '[]',
    project_status_config JSONB NOT NULL DEFAULT '[]',
    notification_settings JSONB NOT NULL DEFAULT '[]',
    security_settings JSONB NOT NULL DEFAULT '[]',
    briefing_template TEXT,
    terms_and_conditions TEXT,
    logo_base64 TEXT,
    signature_base64 TEXT,
    brand_color TEXT NOT NULL,
    public_page_config JSONB NOT NULL DEFAULT '[]',
    package_share_template TEXT,
    booking_form_template TEXT,
    chat_templates JSONB NOT NULL DEFAULT '[]',
    billing_templates JSONB NOT NULL DEFAULT '[]',
    invoice_share_template TEXT,
    receipt_share_template TEXT,
    expense_share_template TEXT,
    portal_share_template TEXT,
    checklist_templates JSONB NOT NULL DEFAULT '[]',
    contract_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Table: promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    usage_count INTEGER NOT NULL,
    max_usage INTEGER NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: team_members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    standard_fee INTEGER NOT NULL DEFAULT 0,
    no_rek TEXT NOT NULL,
    bank_name TEXT,
    specialization TEXT,
    location TEXT,
    emergency_contact TEXT,
    rating INTEGER NOT NULL,
    performance_notes JSONB NOT NULL DEFAULT '[]',
    portal_access_id UUID NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_phone ON public.team_members(phone);

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    restricted_cards JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Table: bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON public.bookings(client_id);

-- Table: calendar_events
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    event_type TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT,
    end_time TEXT,
    notes TEXT,
    team JSONB NOT NULL DEFAULT '[]',
    image TEXT,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: clients
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    since TIMESTAMP WITH TIME ZONE NOT NULL,
    instagram TEXT,
    status TEXT NOT NULL,
    client_type TEXT NOT NULL,
    last_contact TIMESTAMP WITH TIME ZONE NOT NULL,
    portal_access_id UUID NOT NULL,
    address TEXT,
    package_id UUID,
    package_name TEXT,
    package_price INTEGER NOT NULL DEFAULT 0,
    selected_add_on_ids TEXT,
    add_ons_total INTEGER NOT NULL DEFAULT 0,
    promo_code TEXT,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    dp_amount INTEGER NOT NULL DEFAULT 0,
    dp_payment_ref TEXT,
    payment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Table: client_feedback
CREATE TABLE IF NOT EXISTS public.client_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    satisfaction TEXT NOT NULL,
    rating INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number TEXT NOT NULL,
    client_id UUID NOT NULL,
    project_id UUID NOT NULL,
    signing_date DATE NOT NULL,
    signing_location TEXT NOT NULL,
    client_name1 TEXT NOT NULL,
    client_address1 TEXT NOT NULL,
    client_phone1 TEXT NOT NULL,
    client_name2 TEXT NOT NULL,
    client_address2 TEXT NOT NULL,
    client_phone2 TEXT NOT NULL,
    shooting_duration TEXT NOT NULL,
    guaranteed_photos TEXT NOT NULL,
    album_details TEXT NOT NULL,
    digital_files_format TEXT NOT NULL,
    other_items TEXT NOT NULL,
    personnel_count TEXT NOT NULL,
    delivery_timeframe TEXT NOT NULL,
    dp_date DATE NOT NULL,
    final_payment_date DATE NOT NULL,
    cancellation_policy TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    vendor_signature TEXT,
    client_signature TEXT,
    include_meterai BOOLEAN NOT NULL DEFAULT false,
    meterai_placement TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project_id ON public.contracts(project_id);

-- Table: galleries
CREATE TABLE IF NOT EXISTS public.galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    region TEXT NOT NULL,
    description TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    public_id TEXT NOT NULL,
    booking_link TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    cover_image_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON public.galleries(user_id);

-- Table: leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_channel TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    address TEXT,
    event_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    icon TEXT NOT NULL,
    link JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: pockets
CREATE TABLE IF NOT EXISTS public.pockets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    goal_amount TEXT,
    lock_end_date TEXT,
    members JSONB NOT NULL DEFAULT '[]',
    source_card_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Table: projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_id UUID NOT NULL,
    project_type TEXT NOT NULL,
    package_name TEXT NOT NULL,
    package_id UUID,
    add_ons JSONB NOT NULL DEFAULT '[]',
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    deadline_date TIMESTAMP WITH TIME ZONE,
    location TEXT NOT NULL,
    progress INTEGER NOT NULL,
    status TEXT NOT NULL,
    active_sub_statuses JSONB NOT NULL DEFAULT '[]',
    total_cost INTEGER NOT NULL DEFAULT 0,
    amount_paid INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL,
    team JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    accommodation TEXT,
    drive_link TEXT,
    client_drive_link TEXT,
    final_drive_link TEXT,
    start_time TEXT,
    end_time TEXT,
    image TEXT,
    color TEXT,
    status_history JSONB DEFAULT '[]',
    promo_code_id UUID,
    discount_amount INTEGER DEFAULT 0,
    shipping_details TEXT,
    dp_proof_url TEXT,
    printing_details JSONB DEFAULT '[]',
    printing_cost INTEGER DEFAULT 0,
    transport_cost INTEGER DEFAULT 0,
    transport_paid BOOLEAN DEFAULT false,
    transport_note TEXT,
    printing_card_id UUID,
    transport_card_id UUID,
    transport_details JSONB NOT NULL DEFAULT '[]',
    transport_used BOOLEAN NOT NULL DEFAULT false,
    custom_costs JSONB DEFAULT '[]',
    is_editing_confirmed_by_client BOOLEAN NOT NULL DEFAULT false,
    is_printing_confirmed_by_client BOOLEAN NOT NULL DEFAULT false,
    is_delivery_confirmed_by_client BOOLEAN NOT NULL DEFAULT false,
    confirmed_sub_statuses JSONB NOT NULL DEFAULT '[]',
    client_sub_status_notes JSONB NOT NULL DEFAULT '[]',
    sub_status_confirmation_sent_at JSONB NOT NULL DEFAULT '[]',
    completed_digital_items JSONB DEFAULT '[]',
    invoice_signature TEXT,
    custom_sub_statuses JSONB NOT NULL DEFAULT '[]',
    booking_status TEXT,
    rejection_reason TEXT,
    chat_history JSONB NOT NULL DEFAULT '[]',
    duration_selection TEXT,
    unit_price INTEGER DEFAULT 0,
    address TEXT,
    wedding_day_checklist JSONB NOT NULL DEFAULT '[]',
    inventory_items JSONB NOT NULL DEFAULT '[]',
    event_details JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);

-- Table: project_add_ons
CREATE TABLE IF NOT EXISTS public.project_add_ons (
    project_id UUID NOT NULL,
    add_on_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_add_ons_project_id ON public.project_add_ons(project_id);

-- Table: project_team_assignments
CREATE TABLE IF NOT EXISTS public.project_team_assignments (
    project_id UUID NOT NULL,
    member_id UUID NOT NULL,
    member_name TEXT NOT NULL,
    member_role TEXT NOT NULL,
    fee INTEGER NOT NULL DEFAULT 0,
    sub_job TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_team_assignments_project_id ON public.project_team_assignments(project_id);

-- Table: team_payment_records
CREATE TABLE IF NOT EXISTS public.team_payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_number TEXT NOT NULL,
    team_member_id UUID NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    project_payment_ids JSONB NOT NULL DEFAULT '[]',
    total_amount INTEGER NOT NULL DEFAULT 0,
    vendor_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_payment_records_team_member_id ON public.team_payment_records(team_member_id);

-- Table: team_project_payments
CREATE TABLE IF NOT EXISTS public.team_project_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    team_member_name TEXT NOT NULL,
    team_member_id UUID NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    fee INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_project_payments_status ON public.team_project_payments(status);
CREATE INDEX IF NOT EXISTS idx_team_project_payments_project_id ON public.team_project_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_team_project_payments_team_member_id ON public.team_project_payments(team_member_id);

-- Table: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    project_id UUID,
    category TEXT NOT NULL,
    method TEXT NOT NULL,
    pocket_id UUID,
    card_id UUID,
    printing_item_id UUID,
    vendor_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON public.transactions(project_id);

-- Table: vendor_portfolios
CREATE TABLE IF NOT EXISTS public.vendor_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    youtube_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_vendor_portfolios_user_id ON public.vendor_portfolios(user_id);

-- Table: vendor_profiles
CREATE TABLE IF NOT EXISTS public.vendor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    info_images JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    hero_images JSONB NOT NULL DEFAULT '[]',
    faqs JSONB NOT NULL DEFAULT '[]',
    partners JSONB NOT NULL DEFAULT '[]',
    videos JSONB NOT NULL DEFAULT '[]'
);


-- Table: wedding_day_checklists
CREATE TABLE IF NOT EXISTS public.wedding_day_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL,
    category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wedding_day_checklists_project_id ON public.wedding_day_checklists(project_id);


-- ============================================
-- TRIGGER FOR AUTO-UPDATE updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at 
    BEFORE UPDATE ON public.galleries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_portfolios_updated_at 
    BEFORE UPDATE ON public.vendor_portfolios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at 
    BEFORE UPDATE ON public.vendor_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wedding_day_checklists_updated_at 
    BEFORE UPDATE ON public.wedding_day_checklists 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- TABLE COMMENTS
-- ============================================

COMMENT ON TABLE public.add_ons IS 'Generated from backup: 7 rows';
COMMENT ON TABLE public.cards IS 'Generated from backup: 2 rows';
COMMENT ON TABLE public.packages IS 'Generated from backup: 1 rows';
COMMENT ON TABLE public.profiles IS 'Generated from backup: 2 rows';
COMMENT ON TABLE public.promo_codes IS 'Generated from backup: 2 rows';
COMMENT ON TABLE public.team_members IS 'Generated from backup: 4 rows';
COMMENT ON TABLE public.users IS 'Generated from backup: 3 rows';
COMMENT ON TABLE public.bookings IS 'Generated from backup: 1 rows';
COMMENT ON TABLE public.calendar_events IS 'Generated from backup: 2 rows';
COMMENT ON TABLE public.clients IS 'Generated from backup: 12 rows';
COMMENT ON TABLE public.client_feedback IS 'Generated from backup: 2 rows';
COMMENT ON TABLE public.contracts IS 'Generated from backup: 1 rows';
COMMENT ON TABLE public.galleries IS 'Generated from backup: 1 rows';
COMMENT ON TABLE public.leads IS 'Generated from backup: 14 rows';
COMMENT ON TABLE public.notifications IS 'Generated from backup: 19 rows';
COMMENT ON TABLE public.pockets IS 'Generated from backup: 4 rows';
COMMENT ON TABLE public.projects IS 'Generated from backup: 12 rows';
COMMENT ON TABLE public.project_add_ons IS 'Generated from backup: 14 rows';
COMMENT ON TABLE public.project_team_assignments IS 'Generated from backup: 11 rows';
COMMENT ON TABLE public.team_payment_records IS 'Generated from backup: 5 rows';
COMMENT ON TABLE public.team_project_payments IS 'Generated from backup: 11 rows';
COMMENT ON TABLE public.transactions IS 'Generated from backup: 39 rows';
COMMENT ON TABLE public.vendor_portfolios IS 'Generated from backup: 6 rows';
COMMENT ON TABLE public.vendor_profiles IS 'Generated from backup: 1 rows';
COMMENT ON TABLE public.wedding_day_checklists IS 'Generated from backup: 20 rows';
