const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, sendMessage, getContacts, getUsers } = require('../controllers/messageController');

router.get('/contacts', protect, getContacts);
router.get('/users', protect, getUsers);
router.get('/:userId', protect, getConversation);
router.post('/', protect, sendMessage);

module.exports = router;

