import express from 'express';
import { ScoreController } from '../controllers/scoreController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSubscriber } from '../middleware/role.js';

const router = express.Router();

router.use(authenticate);
router.use(requireSubscriber);

router.get('/', ScoreController.getScores);
router.post('/', ScoreController.addScore);
router.put('/:id', ScoreController.updateScore);
router.delete('/:id', ScoreController.deleteScore);

export default router;
