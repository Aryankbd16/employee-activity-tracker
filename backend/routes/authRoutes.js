const express = require('express');
const { signUp, login, getMyProfile, getAllUsers, getUserById } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.get('/me', protect, getMyProfile);

// 👇 ADMIN ROUTES
router.get('/users', protect, getAllUsers);
router.get('/users/:id', protect, getUserById);

module.exports = router;
