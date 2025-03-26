-- RLS (Row Level Security) Policies for LetWeHire
-- These policies control who can view, insert, update and delete data

-- Profiles Table Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Clients Table Policies
CREATE POLICY "Clients can view their own data"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can update their own data"
  ON clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert their own data"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Talents can view client data"
  ON clients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.account_type = 'talent'
  ));

-- Talents Table Policies
CREATE POLICY "Talents can view their own data"
  ON talents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Talents can update their own data"
  ON talents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Talents can insert their own data"
  ON talents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Clients can view talent data"
  ON talents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.account_type = 'client'
  ));

-- Jobs Table Policies
CREATE POLICY "Clients can manage their own jobs"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = jobs.client_id AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active jobs"
  ON jobs FOR SELECT
  USING (status = 'active');

-- Applications Table Policies
CREATE POLICY "Talents can manage their own applications"
  ON applications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = applications.talent_id AND talents.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view applications for their jobs"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN clients ON jobs.client_id = clients.id
      WHERE applications.job_id = jobs.id AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update application status"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      JOIN clients ON jobs.client_id = clients.id
      WHERE applications.job_id = jobs.id AND clients.user_id = auth.uid()
    )
  );

-- Proposals Table Policies
CREATE POLICY "Clients can manage their own proposals"
  ON proposals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = proposals.client_id AND clients.user_id = auth.uid()
    )
  );

CREATE POLICY "Talents can view proposals for them"
  ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = proposals.talent_id AND talents.user_id = auth.uid()
    )
  );

CREATE POLICY "Talents can update proposal status"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = proposals.talent_id AND talents.user_id = auth.uid()
    )
  );

-- Messages Table Policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Categories and Skills Policies
CREATE POLICY "Everyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view skills"
  ON skills FOR SELECT
  USING (true);

-- Additional Policies for Education, Work Experience, and Projects
CREATE POLICY "Talents can manage their own education"
  ON education FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = education.talent_id AND talents.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view talent education"
  ON education FOR SELECT
  USING (true);

CREATE POLICY "Talents can manage their own work experience"
  ON work_experience FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = work_experience.talent_id AND talents.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view talent work experience"
  ON work_experience FOR SELECT
  USING (true);

CREATE POLICY "Talents can manage their own projects"
  ON projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM talents
      WHERE talents.id = projects.talent_id AND talents.user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view talent projects"
  ON projects FOR SELECT
  USING (true);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviews Policies
CREATE POLICY "Everyone can view public reviews"
  ON reviews FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view reviews they wrote or received"
  ON reviews FOR SELECT
  USING (auth.uid() = reviewer_id OR auth.uid() = subject_id);

CREATE POLICY "Users can write reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update reviews they wrote"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id); 