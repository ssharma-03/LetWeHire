import { Router } from 'express';
import {
  createApplication,
  getApplications,
  updateApplicationStatus,
  scheduleInterview,
} from '../controllers/applications.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Talent routes
router.post('/', authenticateToken, authorizeRoles('talent'), createApplication);
router.get('/talent', authenticateToken, authorizeRoles('talent'), getApplications);

// Client routes
router.get('/client', authenticateToken, authorizeRoles('client'), getApplications);
router.put('/:id/status', authenticateToken, authorizeRoles('client'), updateApplicationStatus);
router.put('/:id/interview', authenticateToken, authorizeRoles('client'), scheduleInterview);

export default router; 