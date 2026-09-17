import express from 'express';
import multer from 'multer';
import { WinnerController } from '../controllers/winnerController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.use(authenticate);

router.get('/my-winnings', WinnerController.getMyWinnings);
router.post('/:id/proof', upload.single('proof'), WinnerController.uploadProof);

export default router;
