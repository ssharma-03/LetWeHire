import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  account_type: 'talent' | 'client' | 'admin' | null;
  onboarding_completed: boolean;
  onboarding_step: number;
  last_active: string | null;
  notifications_settings: {
    email: boolean;
    application_updates: boolean;
    messages: boolean;
    marketing: boolean;
  };
  theme_preference: 'light' | 'dark' | 'system';
}

export interface Talent {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  availability: 'full-time' | 'part-time' | 'contract' | 'freelance' | null;
  years_of_experience: number | null;
  profile_completed: boolean;
  location: string | null;
  primary_role: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  open_to_work: boolean;
  preferred_job_types: string[] | null;
  preferred_work_location: 'remote' | 'onsite' | 'hybrid' | null;
}

export interface Client {
  id: string;
  user_id: string;
  company_name: string | null;
  company_size: string | null;
  industry: string | null;
  company_website: string | null;
  company_description: string | null;
  location: string | null;
  logo_url: string | null;
  verified: boolean;
  profile_completed: boolean;
}

export interface Job {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  title: string;
  description: string;
  skills_required: string[];
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  remote: boolean;
  status: 'draft' | 'active' | 'closed' | 'filled';
  application_deadline: string | null;
  category_id: string;
  perks: string[] | null;
  application_count: number;
  view_count: number;
  is_featured: boolean;
}

export interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string;
  talent_id: string;
  cover_letter: string | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  talent_resume_url: string | null;
  client_notes: string | null;
  interview_scheduled: string | null;
} 