import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, accountType } = req.body;

    // Validate input
    if (!email || !password || !fullName || !accountType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create profile in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id,
          email,
          full_name: fullName,
          account_type: accountType,
          onboarding_completed: false,
          onboarding_step: 0,
          notifications_settings: {
            email: true,
            application_updates: true,
            messages: true,
            marketing: false,
          },
          theme_preference: 'system',
        },
      ])
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Create specific profile based on account type
    if (accountType === 'talent') {
      await supabase.from('talents').insert([
        {
          user_id: authData.user?.id,
          profile_completed: false,
        },
      ]);
    } else if (accountType === 'client') {
      await supabase.from('clients').insert([
        {
          user_id: authData.user?.id,
          profile_completed: false,
        },
      ]);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: authData.user?.id,
        email: authData.user?.email,
        accountType,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        accountType: profile.account_type,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: authData.user?.id,
        email: authData.user?.email,
        accountType: profile.account_type,
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        accountType: profile.account_type,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get additional profile data based on account type
    let additionalData = null;
    if (profile.account_type === 'talent') {
      const { data: talentData } = await supabase
        .from('talents')
        .select('*')
        .eq('user_id', userId)
        .single();
      additionalData = talentData;
    } else if (profile.account_type === 'client') {
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .single();
      additionalData = clientData;
    }

    res.json({
      profile,
      additionalData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const updates = req.body;

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Update additional profile data based on account type
    if (profile.account_type === 'talent') {
      const { error: talentError } = await supabase
        .from('talents')
        .update(updates)
        .eq('user_id', userId);

      if (talentError) {
        return res.status(400).json({ error: talentError.message });
      }
    } else if (profile.account_type === 'client') {
      const { error: clientError } = await supabase
        .from('clients')
        .update(updates)
        .eq('user_id', userId);

      if (clientError) {
        return res.status(400).json({ error: clientError.message });
      }
    }

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 