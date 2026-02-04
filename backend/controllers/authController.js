const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// ================= SIGN UP =================
exports.signUp = async (req, res) => {
  const {
    name,
    email,
    contactNo,
    username,
    password,
    confirmPassword,
    photo,
    document,
    idCard
  } = req.body;

  if (
    !name || !email || !contactNo ||
    !username || !password || !confirmPassword ||
    !photo || !document || !idCard
  ) {
    return res.status(400).json({ message: 'All fields are mandatory' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!validator.isMobilePhone(contactNo, 'en-IN')) {
    return res.status(400).json({ message: 'Invalid phone number' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must be 8 characters with uppercase, lowercase, number & special character'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      contactNo,
      username,
      password: hashedPassword,
      photo,
      document,
      idCard
    });

    await user.save();

    res.status(201).json({ message: 'Sign up successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are mandatory' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET LOGGED-IN USER =================
exports.getMyProfile = async (req, res) => {
  res.json(req.user);
};

// ================= GET ALL USERS (ADMIN) =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET SINGLE USER BY ID =================
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
