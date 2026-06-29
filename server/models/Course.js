const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
});

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    videoUrl: String,
    documents: [documentSchema],
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    order: { type: Number, default: 0 },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'General' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    modules: [moduleSchema],
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublished: { type: Boolean, default: false },
    duration: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
