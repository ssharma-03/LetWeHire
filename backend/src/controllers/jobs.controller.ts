import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { Job } from '../config/supabase';

export const createJob = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.userId;
    const jobData = req.body;

    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.skills_required) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert([
        {
          ...jobData,
          client_id: clientId,
          status: 'draft',
          application_count: 0,
          view_count: 0,
          is_featured: false,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      jobType,
      experienceLevel,
      location,
      remote,
      minSalary,
      maxSalary,
    } = req.query;

    let query = supabase.from('jobs').select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category_id', category);
    }
    if (jobType) {
      query = query.eq('job_type', jobType);
    }
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }
    if (location) {
      query = query.eq('location', location);
    }
    if (remote !== undefined) {
      query = query.eq('remote', remote === 'true');
    }
    if (minSalary) {
      query = query.gte('salary_min', Number(minSalary));
    }
    if (maxSalary) {
      query = query.lte('salary_max', Number(maxSalary));
    }

    // Apply pagination
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit) - 1;
    query = query.range(start, end);

    // Get jobs and count
    const { data: jobs, error, count } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      jobs,
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', job.client_id)
      .single();

    if (clientError) {
      return res.status(400).json({ error: clientError.message });
    }

    // Increment view count
    await supabase
      .from('jobs')
      .update({ view_count: (job.view_count || 0) + 1 })
      .eq('id', id);

    res.json({
      job,
      client,
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = req.user?.userId;
    const updates = req.body;

    // Check if job exists and belongs to client
    const { data: existingJob, error: checkError } = await supabase
      .from('jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (checkError || existingJob?.client_id !== clientId) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    // Update job
    const { data: job, error: updateError } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientId = req.user?.userId;

    // Check if job exists and belongs to client
    const { data: existingJob, error: checkError } = await supabase
      .from('jobs')
      .select('client_id')
      .eq('id', id)
      .single();

    if (checkError || existingJob?.client_id !== clientId) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    // Delete job
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({ error: deleteError.message });
    }

    res.json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClientJobs = async (req: Request, res: Response) => {
  try {
    const clientId = req.user?.userId;
    const { status } = req.query;

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('client_id', clientId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      jobs,
    });
  } catch (error) {
    console.error('Get client jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 