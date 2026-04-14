const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/authMiddleware');

const {
  listSessions,
  createSession,
  getSession,
  addMessage,
  deleteSession,
} = require('../controllers/chatController');

router.get('/',           protect, listSessions);
router.post('/',          protect, createSession);
router.get('/:id',        protect, getSession);
router.post('/:id/message', protect, addMessage);
router.delete('/:id',     protect, deleteSession);

module.exports = router;