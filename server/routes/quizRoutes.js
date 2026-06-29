const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, attemptQuiz, getMyResult } = require('../controllers/quizController');

router.get('/', protect, getQuizzes);
router.get('/:id', protect, getQuiz);
router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.put('/:id', protect, authorize('instructor', 'admin'), updateQuiz);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteQuiz);
router.post('/:id/attempt', protect, authorize('student'), attemptQuiz);
router.get('/:id/results', protect, getMyResult);

module.exports = router;
