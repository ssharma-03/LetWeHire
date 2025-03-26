# Setting Up LetWeHire Database in Supabase

Follow these steps to set up your Supabase database for the LetWeHire application:

## Step 1: Log into Supabase

1. Go to [app.supabase.com](https://app.supabase.com) and log in to your account
2. Select your "leguwfgdcnyhfuvwrqfs" project

## Step 2: Run the Database Setup Script

1. In the Supabase dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open the `database_setup.sql` file from your project
4. Copy the entire contents and paste it into the SQL Editor
5. Click "Run" to execute the script
6. Wait for the script to complete - this will create all necessary tables for your application

## Step 3: Apply Row-Level Security Policies

1. Click "New Query" again in the SQL Editor
2. Open the `database_rls_policies.sql` file from your project
3. Copy the contents and paste it into the SQL Editor
4. Click "Run" to apply all security policies
5. These policies ensure that users can only access data they are authorized to see

## Step 4: Verify Tables Were Created

1. Go to "Table Editor" in the left sidebar
2. You should see all the tables listed:
   - profiles
   - clients
   - talents
   - jobs
   - applications
   - proposals
   - categories
   - skills
   - etc.

3. Click on different tables to ensure they have the correct structure

## Step 5: Test User Registration

1. Run your application locally with `npm run dev`
2. Navigate to the signup page and create a test account
3. Check the "Authentication" section in Supabase to see if the user was created
4. Check the "Table Editor" > "profiles" to see if a profile was created for the user

## Troubleshooting

If you encounter any errors:

1. Check the SQL Editor error messages
2. Look at the Supabase dashboard logs
3. Check your application console for error messages
4. Make sure your `.env.local` file has the correct Supabase URL and API key 