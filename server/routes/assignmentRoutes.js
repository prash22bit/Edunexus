const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAssignments, getAssignment, createAssignment, updateAssignment,
    deleteAssignment, submitAssignment, gradeSubmission
} = require('../controllers/assignmentController');

router.get('/', protect, getAssignments);
router.get('/:id', protect, getAssignment);
router.post('/', protect, authorize('instructor', 'admin'), createAssignment);
router.put('/:id', protect, authorize('instructor', 'admin'), updateAssignment);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteAssignment);
router.post('/:id/submit', protect, authorize('student'), submitAssignment);
router.put('/:id/grade/:submissionId', protect, authorize('instructor', 'admin'), gradeSubmission);

module.exports = router;
