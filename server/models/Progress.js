const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedModules: [{ type: mongoose.Schema.Types.ObjectId }],
    percentage: { type: Number, default: 0 },
    lastAccessed: { type: Date, default: Date.now },
}, { timestamps: true });

progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
