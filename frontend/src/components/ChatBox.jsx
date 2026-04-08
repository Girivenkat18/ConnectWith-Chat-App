import React, { useEffect, useState, useRef } from 'react';
import { ChatState } from '../Context/ChatProvider';
import axios from 'axios';
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react';
import io from 'socket.io-client';

const ENDPOINT = '';
var socket, selectedChatCompare;

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { selectedChat, user, notification, setNotification } = ChatState();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);
    socket.on('connected', () => setSocketConnected(true));
    socket.on('typing', () => setIsTyping(true));
    socket.on('stop typing', () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);
      const { data } = await axios.get(
        `/api/messages/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit('join chat', selectedChat._id);
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Make sure we only have one listener to avoid duplicates
    socket.off('message recieved');
    socket.on('message recieved', (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const sendMessage = async (mediaUrl = '') => {
    if (!newMessage.trim() && !mediaUrl) return;

    socket.emit('stop typing', selectedChat._id);

    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const messageContent = newMessage;
      setNewMessage('');

      const { data } = await axios.post(
        '/api/messages',
        {
          content: messageContent,
          chatId: selectedChat._id,
          mediaUrl: mediaUrl,
        },
        config
      );

      socket.emit('new message', data);
      setMessages([...messages, data]);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit('stop typing', selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/upload', formData, config);
      sendMessage(data.url);
    } catch (error) {
      console.error('File upload failed', error);
      alert(`Failed to upload file. ${error.response?.data?.message || ''}`);
    } finally {
      setUploading(false);
    }
  };

  const getSender = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1]?.username : users[0]?.username;
  };

  if (!selectedChat) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          <h2>Select a chat to start messaging</h2>
          <p>Or find a new user from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3 style={{ marginLeft: '10px' }}>
          {!selectedChat.isGroupChat
            ? getSender(user, selectedChat.users)
            : selectedChat.chatName.toUpperCase()}
        </h3>
      </div>

      <div className="messages-container">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#6b7280' }}>
            Loading messages...
          </div>
        ) : (
          messages.map((m, i) => {
            const isSent = m.sender._id === user._id;
            return (
              <div
                className={`message ${isSent ? 'sent' : 'received'}`}
                key={m._id}
              >
                {!isSent && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '4px' }}>
                    <img
                      alt={m.sender.username}
                      src={m.sender.profilePic}
                      className="avatar"
                      style={{ width: '32px', height: '32px', marginBottom: '2px', borderRadius: '50%' }}
                      title={m.sender.username}
                    />
                    {selectedChat.isGroupChat && (
                      <span style={{ fontSize: '0.55rem', color: '#7b5e6b', maxWidth: '45px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                         {m.sender.username}
                      </span>
                    )}
                  </div>
                )}
                <div className="message-bubble">
                  {m.mediaUrl && (
                    <img src={m.mediaUrl} alt="attachment" className="message-media" />
                  )}
                  {m.content && <span>{m.content}</span>}
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '4px', textAlign: isSent ? 'right' : 'left' }}>
                     {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTyping && (
          <div className="message received">
            <div className="message-bubble" style={{ padding: '0.5rem 1rem', fontStyle: 'italic', color: '#6b7280' }}>
              typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <label htmlFor="file-upload" className="icon-btn" style={{ cursor: 'pointer' }}>
           <Paperclip size={20} />
        </label>
        <input 
           id="file-upload" 
           type="file" 
           accept="image/*,video/*,application/pdf" 
           style={{display: 'none'}} 
           onChange={handleFileUpload}
        />
        
        <input
          type="text"
          className="message-input"
          placeholder={uploading ? "Uploading media..." : "Type a message..."}
          onChange={typingHandler}
          value={newMessage}
          onKeyDown={handleKeyDown}
          disabled={uploading}
        />
        <button className="icon-btn send-btn" onClick={() => sendMessage()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
