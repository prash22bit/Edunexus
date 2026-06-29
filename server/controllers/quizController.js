const Quiz = require('../models/Quiz');

// @route GET /api/quizzes?course=
const getQuizzes = async (req, res) => {
    const filter = req.query.course ? { course: req.query.course } : {};
    const quizzes = await Quiz.find(filter).populate('course', 'title').populate('instructor', 'name');
    res.json(quizzes);
};

// @route GET /api/quizzes/:id
const getQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title').populate('instructor', 'name');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // hide correct answers for students
    if (req.user.role === 'student') {
        const safeQuiz = quiz.toObject();
        safeQuiz.questions = safeQuiz.questions.map(q => ({ ...q, correctAnswer: undefined }));
        return res.json(safeQuiz);
    }
    res.json(quiz);
};

// @route POST /api/quizzes
const createQuiz = async (req, res) => {
    const quiz = await Quiz.create({ ...req.body, instructor: req.user._id });
    res.status(201).json(quiz);
};

// @route PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    Object.assign(quiz, req.body);
    const updated = await quiz.save();
    res.json(updated);
};

// @route DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted' });
};

// @route POST /api/quizzes/:id/attempt
const attemptQuiz = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    const { answers } = req.body;
    let score = 0;
    let totalPoints = 0;
    quiz.questions.forEach((q, i) => {
        totalPoints += q.points;
        if (answers[i] === q.correctAnswer) score += q.points;
    });
    quiz.attempts.push({ student: req.user._id, answers, score, totalPoints });
    await quiz.save();
    res.json({ score, totalPoints, percentage: Math.round((score / totalPoints) * 100) });
};

// @route GET /api/quizzes/:id/results
const getMyResult = async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    const attempt = quiz.attempts.filter(a => a.student.toString() === req.user._id.toString()).pop();
    res.json(attempt || null);
};

module.exports = { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz, attemptQuiz, getMyResult };
