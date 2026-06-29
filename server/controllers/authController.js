const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc  Register user
// @route POST /api/auth/register
const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const allowedRoles = ['student', 'instructor'];
    const userRole = allowedRoles.includes(role) ? role : 'student';
    const user = await User.create({ name, email, password, role: userRole });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc  Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
    res.json(req.user);
};

// @desc  Generate password reset token
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    // In production, send email. For now return token.
    res.json({ message: 'Reset token generated', resetToken });
};

// @desc  Reset password
// @route PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successful', token: generateToken(user._id) });
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
