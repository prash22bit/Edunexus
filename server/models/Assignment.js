const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: String,
    textAnswer: String,
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, default: null },
    feedback: { type: String, default: '' },
    isGraded: { type: Boolean, default: false },
});

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number, default: 100 },
    submissions: [submissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
