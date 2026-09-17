import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/role.js';
import { AdminUserController } from '../controllers/admin/adminUserController.js';
import { AdminDrawController } from '../controllers/admin/adminDrawController.js';
import { AdminCharityController } from '../controllers/admin/adminCharityController.js';
import { AdminWinnerController } from '../controllers/admin/adminWinnerController.js';
import { AdminReportController } from '../controllers/admin/adminReportController.js';

const router = express.Router();

// Strict Server-Side Authentication & Administrator RBAC enforcement
router.use(authenticate);
router.use(requireAdmin);

// 1. User Management
router.get('/users', AdminUserController.getAllUsers);
router.put('/users/:id', AdminUserController.updateUser);
router.put('/scores/:scoreId', AdminUserController.overrideUserScore);

// 2. Draw Management (Configure -> Simulate -> Review -> Publish)
router.get('/draws', AdminDrawController.getAllDraws);
router.post('/draws', AdminDrawController.createDraftDraw);
router.post('/draws/:id/simulate', AdminDrawController.simulateDraw);
router.post('/draws/:id/publish', AdminDrawController.publishDraw);

// 3. Charity Management
router.post('/charities', AdminCharityController.createCharity);
router.put('/charities/:id', AdminCharityController.updateCharity);
router.delete('/charities/:id', AdminCharityController.deleteCharity);

// 4. Winner Management
router.get('/winners', AdminWinnerController.getAllWinners);
router.put('/winners/:id/verify', AdminWinnerController.verifyWinner);
router.put('/winners/:id/payout', AdminWinnerController.markPayout);

// 5. Reports & Analytics
router.get('/reports', AdminReportController.getAnalyticsSummary);

export default router;
