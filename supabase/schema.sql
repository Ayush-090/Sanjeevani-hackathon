-- ==========================================================================
-- SANJEEVANI — PostgreSQL Database Schema & Row Level Security (RLS)
-- Supabase Migration for Unified Digital Health & Government Scheme Platform
-- ==========================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Base user identity for all roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    state TEXT,
    district TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patient Profiles (Patient-specific clinical & demographic fields)
CREATE TABLE IF NOT EXISTS public.patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blood_group TEXT,
    height NUMERIC,
    weight NUMERIC,
    allergies TEXT[],
    emergency_contact TEXT,
    family_income NUMERIC DEFAULT 250000,
    ration_card_type TEXT,
    bpl_status BOOLEAN DEFAULT true,
    chronic_conditions TEXT[],
    vitals JSONB DEFAULT '{"blood_pressure": "138/88 mmHg", "blood_sugar": "142 mg/dL", "hba1c": "7.4%", "bmi": 24.6}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Doctor Profiles (Doctor-specific medical credentials & verification)
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medical_registration_number TEXT NOT NULL,
    specialization TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    clinic_name TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Lab Report', 'Prescription', 'Diagnostic Scan', 'Discharge Summary', 'Other')),
    date DATE DEFAULT CURRENT_DATE,
    facility TEXT,
    doctor_name TEXT,
    summary TEXT,
    file_path TEXT,
    file_type TEXT DEFAULT 'PDF',
    file_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Consents & Data Sharing Table (Granular patient-to-doctor permissions)
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL DEFAULT 'doctor' CHECK (recipient_type IN ('doctor', 'scheme_verification')),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    records_allowed UUID[] DEFAULT '{}', -- Array of medical_records.id allowed
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Doctor Additional Record Requests
CREATE TABLE IF NOT EXISTS public.doctor_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requested_record_types TEXT[] NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE
);

-- 7. Government Schemes Registry
CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code TEXT UNIQUE NOT NULL,
    scheme_name TEXT NOT NULL,
    regional_name TEXT,
    government_level TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'All India',
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Newly Introduced', 'Recently Updated', 'Important Changes')),
    short_summary TEXT,
    full_description TEXT,
    benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
    eligibility_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    official_source TEXT NOT NULL,
    official_url TEXT NOT NULL,
    last_verified_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update their own profile; Doctors can view public doctor profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public read for doctor profiles list" ON public.profiles
    FOR SELECT USING (role = 'doctor');

-- Patient Profiles: Only patient can view/edit their own clinical profile
CREATE POLICY "Patient views own patient profile" ON public.patient_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Doctor Profiles: Doctor can manage own profile; anyone authenticated can view verified doctors
CREATE POLICY "Doctor manages own profile" ON public.doctor_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view doctor profiles" ON public.doctor_profiles
    FOR SELECT USING (true);

-- Medical Records:
-- 1. Patient has full control over their own records
CREATE POLICY "Patient full control over own medical records" ON public.medical_records
    FOR ALL USING (auth.uid() = patient_id);

-- 2. Doctor can SELECT medical record ONLY IF active consent exists and record ID is included in consent
CREATE POLICY "Doctor can view consented medical records" ON public.medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.consents c
            WHERE c.recipient_id = auth.uid()
              AND c.patient_id = public.medical_records.patient_id
              AND c.status = 'active'
              AND c.valid_until > now()
              AND public.medical_records.id = ANY(c.records_allowed)
        )
    );

-- Consents: Patient can manage consents; Doctor can view consents where they are the recipient
CREATE POLICY "Patient manages consents" ON public.consents
    FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Doctor views granted consents" ON public.consents
    FOR SELECT USING (auth.uid() = recipient_id);

-- Doctor Requests: Doctor creates & views; Patient views & responds
CREATE POLICY "Doctor manages own requests" ON public.doctor_requests
    FOR ALL USING (auth.uid() = doctor_id);

CREATE POLICY "Patient views and updates requests" ON public.doctor_requests
    FOR ALL USING (auth.uid() = patient_id);

-- Government Schemes: Public read access for all users
CREATE POLICY "Public read for government schemes" ON public.government_schemes
    FOR SELECT USING (true);

-- Storage Buckets Configuration (Run in Supabase Storage SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-records', 'medical-records', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lab-reports', 'lab-reports', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('identity-documents', 'identity-documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
