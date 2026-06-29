const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// @route GET /api/assignments?course=
const getAssignments = async (req, res) => {
    const filter = req.query.course ? { course: req.query.course } : {};
    if (req.user.role === 'instructor') filter.instructor = req.user._id;
    const assignments = await Assignment.find(filter).populate('course', 'title').populate('instructor', 'name');
    res.json(assignments);
};

// @route GET /api/assignments/:id
const getAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id)
        .populate('course', 'title')
        .populate('instructor', 'name')
        .populate('submissions.student', 'name email');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
};

// @route POST /api/assignments
const createAssignment = async (req, res) => {
    const { title, description, attachmentUrl, course, deadline, maxMarks } = req.body;
    const assignment = await Assignment.create({ title, description, attachmentUrl, course, deadline, maxMarks, instructor: req.user._id });
    res.status(201).json(assignment);
};

// @route PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    if (assignment.instructor.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });
    Object.assign(assignment, req.body);
    const updated = await assignment.save();
    res.json(updated);
};

// @route DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
};

// @route POST /api/assignments/:id/submit
const submitAssignment = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    const alreadySubmitted = assignment.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (alreadySubmitted) return res.status(400).json({ message: 'Already submitted' });
    assignment.submissions.push({ student: req.user._id, textAnswer: req.body.textAnswer, fileUrl: req.body.fileUrl });
    await assignment.save();
    res.status(201).json({ message: 'Submitted successfully' });
};

// @route PUT /api/assignments/:id/grade/:submissionId
const gradeSubmission = async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Not found' });
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.isGraded = true;
    await assignment.save();
    res.json({ message: 'Graded successfully' });
};

module.exports = { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment, submitAssignment, gradeSubmission };
