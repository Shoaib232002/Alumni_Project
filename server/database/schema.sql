-- Create tables for Alumni Management System

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alumni table
CREATE TABLE alumni (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  batch TEXT NOT NULL,
  degree TEXT NOT NULL,
  current_company TEXT,
  designation TEXT,
  linkedin_profile TEXT,
  naukri_profile TEXT,
  other_profiles JSONB,
  bio TEXT,
  image TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumni_id UUID REFERENCES alumni(id),
  alumni_name TEXT NOT NULL,
  text TEXT,
  video_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT FALSE
);

-- Fundraising campaigns table
CREATE TABLE fundraising_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal NUMERIC NOT NULL,
  raised NUMERIC DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES fundraising_campaigns(id),
  alumni_id UUID REFERENCES alumni(id),
  amount NUMERIC NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  for TEXT NOT NULL CHECK (for IN ('admin', 'all'))
);

-- College info table
CREATE TABLE college_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  established TEXT NOT NULL,
  website TEXT NOT NULL,
  logo TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_alumni_batch ON alumni(batch);
CREATE INDEX idx_feedback_alumni_id ON feedback(alumni_id);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_notifications_for ON notifications(for);

-- Insert default college info
INSERT INTO college_info (name, location, established, website, logo)
VALUES ('Tech University', 'New York, USA', '1980', 'https://www.techuniversity.edu', '/images/Logo.jpg');

-- Insert default admin user
INSERT INTO users (name, email, password, role, is_verified)
VALUES ('Admin', 'admin@techuniversity.edu', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'admin', TRUE);
-- Password is 'password' (hashed)

-- Insert default regular user
INSERT INTO users (name, email, password, role, is_verified)
VALUES ('User', 'user@example.com', '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC', 'user', TRUE);
-- Password is 'password' (hashed)