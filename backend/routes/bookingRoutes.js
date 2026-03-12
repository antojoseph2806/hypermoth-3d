import express from 'express';
import { getUserBookings, createBooking } from '../controllers/bookingController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateUser, getUserBookings);
router.post('/', authenticateUser, createBooking);

export default router;
