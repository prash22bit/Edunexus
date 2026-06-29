const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [String],
    correctAnswer: { type: Number, required: true }, // index of correct option
    points: { type: Number, default: 1 },
});

const quizAttemptSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [Number],
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 30 }, // in minutes
    attempts: [quizAttemptSchema],
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
