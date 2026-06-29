const Message = require('../models/Message');
const User = require('../models/User');

// @route GET /api/messages/users
const getUsers = async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name role email');
    res.json(users);
};

// @route GET /api/messages/:userId
const getConversation = async (req, res) => {
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: req.params.userId },
            { sender: req.params.userId, receiver: req.user._id },
        ]
    }).sort('createdAt').populate('sender', 'name role').populate('receiver', 'name role');
    // mark as read
    await Message.updateMany({ sender: req.params.userId, receiver: req.user._id, isRead: false }, { isRead: true });
    res.json(messages);
};

// @route POST /api/messages
const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
        return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    const msg = await Message.create({ sender: req.user._id, receiver: receiverId, content });
    const populated = await msg.populate('sender', 'name role');
    res.status(201).json(populated);
};

// @route GET /api/messages/contacts
const getContacts = async (req, res) => {
    const messages = await Message.find({
        $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name role').populate('receiver', 'name role');
    const contactIds = new Set();
    messages.forEach(m => {
        if (m.sender && m.receiver && m.sender._id && m.receiver._id) {
            const other = m.sender._id.toString() === req.user._id.toString() ? m.receiver : m.sender;
            if (other && other._id) {
                contactIds.add(other._id.toString());
            }
        }
    });
    const contacts = await User.find({ _id: { $in: [...contactIds] } }).select('name role email');
    const unread = await Message.countDocuments({ receiver: req.user._id, isRead: false });
    res.json({ contacts, unread });
};

module.exports = { getConversation, sendMessage, getContacts, getUsers };

