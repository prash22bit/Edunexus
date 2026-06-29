const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getCourses, getCourse, createCourse, updateCourse, deleteCourse,
    enrollCourse, addModule, updateModule, deleteModule, updateProgress, getProgress
} = require('../controllers/courseController');

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourse);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);
router.post('/:id/modules', protect, authorize('instructor', 'admin'), addModule);
router.put('/:id/modules/:moduleId', protect, authorize('instructor', 'admin'), updateModule);
router.delete('/:id/modules/:moduleId', protect, authorize('instructor', 'admin'), deleteModule);
router.post('/:id/progress', protect, authorize('student'), updateProgress);
router.get('/:id/progress', protect, authorize('student'), getProgress);

module.exports = router;
