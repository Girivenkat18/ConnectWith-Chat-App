import React, { useState } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider';
import { X } from 'lucide-react';

const GroupChatModal = ({ isOpen, onClose, fetchAgain, setFetchAgain }) => {
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return setSearchResult([]);

    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/auth?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      console.error('Error fetching users', error);
      setLoading(false);
    }
  };

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      alert('Please fill all the fields');
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post(
        '/api/chats/group',
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      onClose();
      setFetchAgain(!fetchAgain);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button onClick={onClose} className="icon-btn"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Chat Name"
            className="form-input"
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Add Users (eg: girivenkat, john)"
            className="form-input"
            onChange={(e) => handleSearch(e.target.value)}
          />
          
          <div className="selected-users">
            {selectedUsers.map((u) => (
              <span key={u._id} className="badge">
                {u.username}
                <X size={14} className="badge-close" onClick={() => handleDelete(u)} />
              </span>
            ))}
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="search-results-modal">
              {searchResult?.slice(0, 4).map((user) => (
                <div key={user._id} className="search-result-item" onClick={() => handleGroup(user)}>
                  <img src={user.profilePic} alt={user.username} className="avatar-sm" />
                  <span>{user.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary" onClick={handleSubmit}>Create Chat</button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatModal;
