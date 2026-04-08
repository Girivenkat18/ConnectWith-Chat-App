const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username profilePic email')
      .populate('chat');
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  const { content, chatId, mediaUrl } = req.body;

  if ((!content && !mediaUrl) || !chatId) {
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    mediaUrl: mediaUrl || '',
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'username profilePic');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'username profilePic email',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { allMessages, sendMessage };
