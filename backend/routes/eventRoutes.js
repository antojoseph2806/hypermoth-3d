import express from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { getHomepageShowcase } from '../controllers/showcaseController.js';
import { getPublicTopArtists } from '../controllers/topArtistsController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/showcase', getHomepageShowcase);
router.get('/top-artists', getPublicTopArtists);
router.get('/', getAllEvents);
router.get('/:event_id', getEventById);
router.post('/', authenticateUser, requireAdmin, createEvent);
router.put('/:event_id', authenticateUser, requireAdmin, updateEvent);
router.delete('/:event_id', authenticateUser, requireAdmin, deleteEvent);

export default router;
