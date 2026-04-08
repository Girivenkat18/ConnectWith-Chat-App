import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  // Initialize synchronously so ChatPage renders correctly on first load
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo')) || null;
    } catch {
      return null;
    }
  });
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Redirect logic only — user is already set from localStorage above
    if (!user && location.pathname !== '/') {
      navigate('/');
    } else if (user && location.pathname === '/') {
      navigate('/chats');
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
