const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getStats, getUsers, updateUserRole, deleteUser, getReports } = require('../controllers/adminController');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.get('/reports', protect, authorize('admin'), getReports);

module.exports = router;
