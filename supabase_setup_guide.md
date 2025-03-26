# LetWeHire Supabase Setup Guide

This guide will walk you through setting up Supabase for the LetWeHire application and ensuring data is properly stored from the sign-up pages.

## 1. Supabase Project Setup

1. Go to [Supabase](https://supabase.com/) and sign in or create an account
2. Create a new project:
   - Click "New Project"
   - Enter a name (e.g., "LetWeHire")
   - Choose a database password (save this somewhere secure)
   - Select a region closest to your users
   - Click "Create new project"

3. Once your project is created, go to the Settings > API section to find your:
   - Project URL (API URL)
   - Project API Key (anon/public key)

4. Copy these values and update your `.env.local` file (create it if it doesn't exist):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 2. Setting Up Database Tables

1. Go to the SQL Editor section in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `database_setup.sql` into the SQL editor
4. Click "Run" to execute the script and create all your database tables

After the database tables are created:

1. Create another SQL query
2. Copy and paste the contents of `database_rls_policies.sql` into the SQL editor
3. Click "Run" to apply the row-level security policies

## 3. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Under "Site URL", enter your application URL (e.g., `http://localhost:3000` for local development)
3. Configure Email Auth:
   - Enable "Email signup"
   - Optionally, you can customize the email templates

4. Configure OAuth Providers (Optional):
   - Under "External OAuth Providers", enable Google and/or GitHub
   - Follow the provider-specific instructions to set up OAuth credentials

## 4. Verifying Your Setup

1. Start your local development server:
   ```
   cd letwebuild
   npm run dev
   ```

2. Open your application in a browser: http://localhost:3000
3. Try creating a new account using the "Hire Talent" or "Find Work" signup pages
4. Check if the data is being stored in Supabase:
   - Go to your Supabase dashboard
   - Navigate to Table Editor > profiles
   - You should see a new row with the email address you used to sign up
   - The account_type should be set to 'client' or 'talent' depending on which signup option you chose

## 5. Database Structure

The database contains the following main tables:

- **profiles**: Base user information (shared between clients and talents)
- **clients**: Additional information for employer/company accounts
- **talents**: Additional information for talent/freelancer accounts
- **jobs**: Job listings created by clients
- **applications**: Job applications submitted by talents
- **proposals**: Direct work proposals from clients to talents
- **categories**: Job categories
- **skills**: Skills associated with categories
- **education**, **work_experience**, **projects**: Talent profile sections
- **messages**: Communication between users
- **reviews**: Feedback after job completion
- **notifications**: System and user notifications

## 6. Row-Level Security (RLS)

Your database is secured with Row-Level Security policies that ensure:

- Users can only access their own data
- Clients can only see applications for jobs they've posted
- Talents can only see proposals sent to them
- Public data like job listings is visible to everyone

## 7. Troubleshooting

If users aren't being stored in the database:

1. Check the browser console for any errors
2. Verify your Supabase credentials in `.env.local`
3. Make sure the database tables were created successfully
4. Check the Supabase logs for any authentication errors

## 8. Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) 