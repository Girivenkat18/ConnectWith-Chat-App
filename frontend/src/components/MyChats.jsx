import React, { useEffect, useState } from 'react';
import { ChatState } from '../Context/ChatProvider';
import axios from 'axios';
import { LogOut, Search, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupChatModal from './GroupChatModal';
import ProfileModal from './ProfileModal';

const MyChats = ({ fetchAgain, setFetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const { selectedChat, setSelectedChat, user, chats, setChats, notification, setNotification } = ChatState();
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get('/api/chats', config);
      setChats(data);
    } catch (error) {
      console.error('Failed to load the chats', error);
    }
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (!e.target.value) {
      setSearchResult([]);
      return;
    }

    try {
      setLoadingSearch(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/auth?search=${e.target.value}`, config);
      setLoadingSearch(false);
      setSearchResult(data);
    } catch (error) {
      console.error('Failed to load search results', error);
    }
  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          'Content-type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/chats', { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearch('');
      setSearchResult([]);
    } catch (error) {
      console.error('Error fetching chat', error);
    }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const getSender = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1]?.username : users[0]?.username;
  };

  const getSenderPic = (loggedUser, users) => {
    return users[0]?._id === loggedUser?._id ? users[1]?.profilePic : users[0]?.profilePic;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Connect<span style={{color: '#8b5cf6'}}>With</span></h2>
        <div style={{display: 'flex', gap: '8px', position: 'relative', alignItems: 'center'}}>
           <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} title="Notifications">
              <Bell size={20} />
              {notification.length > 0 && <span className="notification-badge">{notification.length}</span>}
           </button>

           {isNotifOpen && (
             <div className="notification-dropdown">
               {!notification.length && <div className="notif-item">No New Messages</div>}
               {notification.map(notif => (
                 <div key={notif._id} className="notif-item" onClick={() => {
                   setSelectedChat(notif.chat);
                   setNotification(notification.filter((n) => n !== notif));
                   setIsNotifOpen(false);
                 }}>
                   {notif.chat.isGroupChat 
                     ? `New Message in ${notif.chat.chatName}`
                     : `New Message from ${getSender(user, notif.chat.users)}`
                   }
                 </div>
               ))}
             </div>
           )}

           <button className="icon-btn" onClick={() => setIsGroupModalOpen(true)} title="Create Group"><Users size={20} /></button>
           <button className="icon-btn" onClick={() => setIsProfileModalOpen(true)} title="My Profile" style={{ padding: '2px' }}>
             <img src={user?.profilePic} alt="profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
           </button>
           <button className="logout-btn icon-btn" onClick={logoutHandler} title="Logout"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="search-box">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search by username..."
            value={search}
            onChange={handleSearch}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        {searchResult?.length > 0 && (
          <div className="search-results">
            {searchResult.map((result) => (
              <div
                onClick={() => accessChat(result._id)}
                key={result._id}
                className="search-result-item"
              >
                <img src={result.profilePic} alt={result.username} className="avatar" />
                <div className="chat-info">
                  <h4>{result.username}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="chat-list">
        {Array.isArray(chats) ? (
          chats.map((chat) => (
            <div
              onClick={() => {
                setSelectedChat(chat);
                setNotification(notification.filter(n => n.chat._id !== chat._id));
              }}
              className={`chat-item ${selectedChat === chat ? 'active' : ''}`}
              key={chat._id}
            >
              <img
                src={!chat.isGroupChat ? getSenderPic(loggedUser, chat.users) : 'https://cdn-icons-png.flaticon.com/512/166/166258.png'}
                alt="avatar"
                className="avatar"
              />
              <div className="chat-info" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h4>
                     {!chat.isGroupChat
                       ? getSender(loggedUser, chat.users)
                       : chat.chatName}
                   </h4>
                   {notification.some(n => n.chat._id === chat._id) && (
                     <div className="unread-dot"></div>
                   )}
                </div>
                {chat.latestMessage && (
                  <p>
                    <b>{chat.latestMessage.sender.username}: </b>
                    {chat.latestMessage.content ? chat.latestMessage.content : "Sent a file"}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-chat">Loading...</div>
        )}
      </div>

      <GroupChatModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)} 
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default MyChats;
