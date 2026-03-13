import express from 'express';
import { getArtistByKey } from '../controllers/artistController.js';

const router = express.Router();

router.get('/:artistKey', getArtistByKey);

export default router;
