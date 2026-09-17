import express from 'express';
import { DrawController } from '../controllers/drawController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public draw information
router.get('/current', (req, res, next) => {
  // Optional auth token check for subscriber eligibility banner
  if (req.headers.authorization) {
    return authenticate(req, res, next);
  }
  next();
}, DrawController.getCurrentDraw);

router.get('/archive', DrawController.getDrawArchive);
router.get('/:id', DrawController.getDrawById);

// Subscriber draw entries
router.get('/user/my-entries', authenticate, DrawController.getMyEntries);

export default router;
