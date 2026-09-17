import express from 'express';
import { CharityController } from '../controllers/charityController.js';

const router = express.Router();

router.get('/', CharityController.getCharities);
router.get('/:slug', CharityController.getCharityBySlug);
router.post('/:charityId/donate', CharityController.createDirectDonation);

export default router;
