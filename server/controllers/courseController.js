const Course = require('../models/Course');
const Progress = require('../models/Progress');

// @route GET /api/courses
const getCourses = async (req, res) => {
    const query = req.user.role === 'instructor'
        ? { instructor: req.user._id }
        : { isPublished: true };
    const courses = await Course.find(query).populate('instructor', 'name email').sort('-createdAt');
    res.json(courses);
};

// @route GET /api/courses/:id
const getCourse = async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'name email')
        .populate('enrolledStudents', 'name email')
        .populate('modules.assignment');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
};

// @route POST /api/courses
const createCourse = async (req, res) => {
    const { title, description, category, level, duration } = req.body;
    const course = await Course.create({ title, description, category, level, duration, instructor: req.user._id });
    res.status(201).json(course);
};

// @route PUT /api/courses/:id
const updateCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Not authorized' });
    Object.assign(course, req.body);
    const updated = await course.save();
    res.json(updated);
};

// @route DELETE /api/courses/:id
const deleteCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Not authorized' });
    await course.deleteOne();
    res.json({ message: 'Course removed' });
};

// @route POST /api/courses/:id/enroll
const enrollCourse = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.enrolledStudents.includes(req.user._id))
        return res.status(400).json({ message: 'Already enrolled' });
    course.enrolledStudents.push(req.user._id);
    await course.save();
    await Progress.create({ student: req.user._id, course: course._id });
    res.json({ message: 'Enrolled successfully' });
};

// @route POST /api/courses/:id/modules
const addModule = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized' });
    course.modules.push(req.body);
    await course.save();
    res.status(201).json(course);
};

// @route PUT /api/courses/:id/modules/:moduleId
const updateModule = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const mod = course.modules.id(req.params.moduleId);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    Object.assign(mod, req.body);
    await course.save();
    res.json(course);
};

// @route DELETE /api/courses/:id/modules/:moduleId
const deleteModule = async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.modules = course.modules.filter(m => m._id.toString() !== req.params.moduleId);
    await course.save();
    res.json(course);
};

// @route POST /api/courses/:id/progress
const updateProgress = async (req, res) => {
    const { moduleId } = req.body;
    const course = await Course.findById(req.params.id);
    let progress = await Progress.findOne({ student: req.user._id, course: req.params.id });
    if (!progress) progress = await Progress.create({ student: req.user._id, course: req.params.id });
    if (!progress.completedModules.includes(moduleId)) progress.completedModules.push(moduleId);
    const total = course.modules.length;
    progress.percentage = total ? Math.round((progress.completedModules.length / total) * 100) : 0;
    progress.lastAccessed = Date.now();
    await progress.save();
    res.json(progress);
};

// @route GET /api/courses/:id/progress
const getProgress = async (req, res) => {
    const progress = await Progress.findOne({ student: req.user._id, course: req.params.id });
    res.json(progress || { percentage: 0, completedModules: [] });
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, enrollCourse, addModule, updateModule, deleteModule, updateProgress, getProgress };
