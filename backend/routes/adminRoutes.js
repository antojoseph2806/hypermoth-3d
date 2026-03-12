import express from 'express';
import {
  getAllUsers,
  deleteUser,
  blockUser,
  getStats,
  getAllBookings,
  confirmBooking,
  verifyQRCode
} from '../controllers/adminController.js';
import {
  getHomepageShowcase,
  updateHomepageShowcase,
  uploadHomepageShowcaseImage,
} from '../controllers/showcaseController.js';
import {
  getTopArtistsAdmin,
  updateTopArtistsAdmin,
} from '../controllers/topArtistsController.js';
import { uploadEventMedia } from '../controllers/eventController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateUser, requireAdmin);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:user_id', deleteUser);
router.post('/users/:user_id/block', blockUser);

// Statistics
router.get('/stats', getStats);
router.get('/showcase', getHomepageShowcase);
router.put('/showcase', updateHomepageShowcase);
router.post('/showcase/upload', upload.single('image'), uploadHomepageShowcaseImage);
router.get('/top-artists', getTopArtistsAdmin);
router.put('/top-artists', updateTopArtistsAdmin);
router.post('/events/upload', upload.array('images', 10), uploadEventMedia);

// Booking management
router.get('/bookings', getAllBookings);
router.patch('/bookings/:booking_id/confirm', confirmBooking);
router.post('/bookings/verify-qr', verifyQRCode);

export default router;
