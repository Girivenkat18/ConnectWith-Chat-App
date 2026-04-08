const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = async (req, res) => {
  const { username, email, password, profilePic } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Please Enter all the Fields' });
    return;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    username,
    email,
    password,
    profilePic: profilePic || undefined,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'User not found' });
  }
};

const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid Email or Password' });
  }
};

const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
};

const updateProfilePic = async (req, res) => {
  const { profilePic } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    throw new Error('User Not Found');
  } else {
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      profilePic: updatedUser.profilePic,
      token: generateToken(updatedUser._id),
    });
  }
};

module.exports = { registerUser, authUser, allUsers, updateProfilePic };
