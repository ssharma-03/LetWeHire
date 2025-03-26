import { Router } from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getClientJobs,
} from '../controllers/jobs.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Client routes
router.post('/', authenticateToken, authorizeRoles('client'), createJob);
router.get('/client/jobs', authenticateToken, authorizeRoles('client'), getClientJobs);
router.put('/:id', authenticateToken, authorizeRoles('client'), updateJob);
router.delete('/:id', authenticateToken, authorizeRoles('client'), deleteJob);

export default router; 