import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const createApplication = async (req: Request, res: Response) => {
  try {
    const talentId = req.user?.userId;
    const { jobId, coverLetter, resumeUrl } = req.body;

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job || job.status !== 'active') {
      return res.status(404).json({ error: 'Job not found or not active' });
    }

    // Check if already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .eq('talent_id', talentId)
      .single();

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Create application
    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert([
        {
          job_id: jobId,
          talent_id: talentId,
          cover_letter: coverLetter,
          talent_resume_url: resumeUrl,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (createError) {
      return res.status(400).json({ error: createError.message });
    }

    // Increment application count
    await supabase
      .from('jobs')
      .update({ application_count: (job.application_count || 0) + 1 })
      .eq('id', jobId);

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const { jobId, status, page = 1, limit = 10 } = req.query;
    const userId = req.user?.userId;

    // Get user's account type
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('applications')
      .select(`
        *,
        jobs (*),
        talents (
          *,
          profiles (
            full_name,
            avatar_url
          )
        )
      `, { count: 'exact' });

    // Apply filters based on user role
    if (profile?.account_type === 'client') {
      query = query.eq('jobs.client_id', userId);
    } else if (profile?.account_type === 'talent') {
      query = query.eq('talent_id', userId);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit) - 1;
    query = query.range(start, end);

    const { data: applications, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      applications,
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.userId;

    // Verify user is client and owns the job
    const { data: application, error: checkError } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          client_id
        )
      `)
      .eq('id', id)
      .single();

    if (checkError || !application || application.jobs.client_id !== userId) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({
        status,
        client_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // If application is hired, update job status
    if (status === 'hired') {
      await supabase
        .from('jobs')
        .update({ status: 'filled' })
        .eq('id', application.job_id);
    }

    res.json({
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { interviewDate } = req.body;
    const userId = req.user?.userId;

    // Verify user is client and owns the job
    const { data: application, error: checkError } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          client_id
        )
      `)
      .eq('id', id)
      .single();

    if (checkError || !application || application.jobs.client_id !== userId) {
      return res.status(404).json({ error: 'Application not found or unauthorized' });
    }

    // Update interview date
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({
        interview_scheduled: interviewDate,
        status: 'shortlisted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Interview scheduled successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 