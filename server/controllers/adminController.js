const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Progress = require('../models/Progress');

// @route GET /api/admin/stats
const getStats = async (req, res) => {
    const [users, courses, assignments, progressList] = await Promise.all([
        User.find().select('-password'),
        Course.find().populate('instructor', 'name'),
        Assignment.find(),
        Progress.find(),
    ]);
    const students = users.filter(u => u.role === 'student').length;
    const instructors = users.filter(u => u.role === 'instructor').length;
    const avgCompletion = progressList.length
        ? Math.round(progressList.reduce((s, p) => s + p.percentage, 0) / progressList.length)
        : 0;
    res.json({ totalUsers: users.length, students, instructors, totalCourses: courses.length, totalAssignments: assignments.length, avgCompletion });
};

// @route GET /api/admin/users
const getUsers = async (req, res) => {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
};

// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = req.body.role;
    await user.save();
    res.json({ message: 'Role updated', user: { _id: user._id, name: user.name, role: user.role } });
};

// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
};

// @route GET /api/admin/reports
const getReports = async (req, res) => {
    const courses = await Course.find().populate('instructor', 'name').lean();
    const reports = await Promise.all(courses.map(async (course) => {
        const progressList = await Progress.find({ course: course._id }).populate('student', 'name email');
        return { ...course, progressList };
    }));
    res.json(reports);
};

module.exports = { getStats, getUsers, updateUserRole, deleteUser, getReports };
